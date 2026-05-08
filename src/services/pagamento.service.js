const { prisma } = require("../lib/prisma");
const AppError = require("../errors/app.error");
const { logAction } = require("./audit-log.service");

async function findAll(actor) {
  const where = {};

  if (actor.role === "cliente") {
    where.atendimento = {
      tutorId: actor.userId,
    };
  }

  return prisma.pagamento.findMany({
    where,
    include: {
      atendimento: {
        include: {
          tutor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              sex: true,
              castrated: true,
            },
          },
         agendamento: {
            select: {
              id: true,
              dataHora: true,
              status: true,
              tipo: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function findById(id, actor) {
  const pagamento = await prisma.pagamento.findUnique({
    where: { id },
    include: {
      atendimento: {
        include: {
          tutor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              sex: true,
              castrated: true,
            },
          },
         agendamento: {
            select: {
              id: true,
              dataHora: true,
              status: true,
              tipo: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!pagamento) {
    throw new AppError("Pagamento não encontrado", 404);
  }

  if (actor.role === "cliente" && pagamento.atendimento.tutorId !== actor.userId) {
    throw new AppError("Acesso negado", 403);
  }

  return pagamento;
}

async function process({ pagamentoId, actor, aprovado, metodo, transacaoId }) {
  return prisma.$transaction(async (tx) => {
    const pagamento = await tx.pagamento.findUnique({
      where: { id: pagamentoId },
      include: {
        atendimento: true,
      },
    });

    if (!pagamento) {
      throw new AppError("Pagamento não encontrado", 404);
    }

    if (actor.role === "cliente" && pagamento.atendimento.tutorId !== actor.userId) {
      throw new AppError("Acesso negado", 403);
    }

    if (pagamento.status !== "pendente") {
      throw new AppError("Pagamento já foi processado", 400);
    }

    const newStatus = aprovado ? "pago" : "recusado";

    const updated = await tx.pagamento.update({
      where: { id: pagamentoId },
      data: {
        status: newStatus,
        metodo: metodo ?? pagamento.metodo ?? "pix",
        transacaoId: transacaoId ?? null,
      },
      include: {
        atendimento: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await tx.historicoAtendimento.create({
      data: {
        atendimentoId: pagamento.atendimentoId,
        tipo: "pagamento",
        descricao: `Pagamento ${newStatus}`,
        actorId: actor.userId,
      },
    });

    await logAction(tx, {
      action: "PAGAMENTO_PROCESSADO",
      entity: "Pagamento",
      entityId: pagamentoId,
      actorId: actor.userId,
      actorRole: actor.role,
      details: `Pagamento ${newStatus}`,
    });

    return updated;
  });
}

module.exports = {
  findAll,
  findById,
  process,
};