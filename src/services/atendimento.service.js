const { prisma } = require("../lib/prisma");
const AppError = require("../errors/app.error");
const { logAction } = require("./audit-log.service");

const statusFlow = {
  agendado: ["confirmado", "cancelado"],
  confirmado: ["em_atendimento", "cancelado"],
  em_atendimento: ["finalizado", "cancelado"],
  finalizado: [],
  cancelado: [],
};

const VALORES_BASE = {
  consulta: 120,
  retorno: 90,
  vacina: 70,
  cirurgia: 350,
  exame: 180,
  internacao: 500,
};

function getValorAtendimento(tipo) {
  return VALORES_BASE[tipo] ?? VALORES_BASE.consulta;
}

async function updateStatus(atendimentoId, newStatus, actor) {
  return prisma.$transaction(async (tx) => {
    const atendimento = await tx.atendimento.findUnique({
      where: { id: atendimentoId },
      include: {
        pagamento: true,
      },
    });

    if (!atendimento) {
      throw new AppError("Atendimento não encontrado", 404);
    }

    const currentStatus = atendimento.status;

    if (currentStatus === newStatus) {
      throw new AppError("Status já está definido", 400);
    }

    if (["finalizado", "cancelado"].includes(currentStatus)) {
      throw new AppError("Não é possível alterar este atendimento", 400);
    }

    const allowedTransitions = statusFlow[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new AppError(
        `Transição inválida de ${currentStatus} para ${newStatus}`,
        400
      );
    }

    if (["em_atendimento", "finalizado"].includes(newStatus)) {
      if (!atendimento.pagamento || atendimento.pagamento.status !== "pago") {
        throw new AppError(
          "Atendimento só pode avançar com pagamento confirmado",
          409
        );
      }
    }

    const updated = await tx.atendimento.update({
      where: { id: atendimentoId },
      data: { status: newStatus },
    });

    await tx.historicoAtendimento.create({
      data: {
        atendimentoId,
        tipo: "status",
        descricao: `${currentStatus} -> ${newStatus}`,
        deStatus: currentStatus,
        paraStatus: newStatus,
        actorId: actor.userId,
      },
    });

    await logAction(tx, {
      action: "ATENDIMENTO_STATUS_ALTERADO",
      entity: "Atendimento",
      entityId: atendimentoId,
      actorId: actor.userId,
      actorRole: actor.role,
      details: `${currentStatus} -> ${newStatus}`,
    });

    const result = await tx.atendimento.findUnique({
      where: { id: atendimentoId },
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
        agendamento: true,
        veterinario: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        pagamento: true,
        historico: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return result;
  });
}

async function create({ agendamentoId, actor }) {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id: agendamentoId },
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
      atendimento: true,
    },
  });

  if (!agendamento) {
    throw new AppError("Agendamento não encontrado", 404);
  }

  if (agendamento.atendimento) {
    throw new AppError("Já existe atendimento para este agendamento", 400);
  }

  if (agendamento.status === "cancelado") {
    throw new AppError(
      "Não é possível criar atendimento para agendamento cancelado",
      400
    );
  }

  if (agendamento.status !== "confirmado") {
    throw new AppError(
      "Atendimento só pode ser criado para agendamento confirmado",
      400
    );
  }

  const atendimento = await prisma.$transaction(async (tx) => {
    const created = await tx.atendimento.create({
      data: {
        tutorId: agendamento.tutorId,
        petId: agendamento.petId,
        agendamentoId: agendamento.id,
        status: "agendado",
      },
    });

    await tx.pagamento.create({
      data: {
        atendimentoId: created.id,
        status: "pendente",
        valor: getValorAtendimento(agendamento.tipo),
        createdById: actor.userId,
      },
    });

    await tx.historicoAtendimento.create({
      data: {
        atendimentoId: created.id,
        tipo: "status",
        descricao: "Atendimento criado com status agendado",
        deStatus: null,
        paraStatus: "agendado",
        actorId: actor.userId,
      },
    });

    await logAction(tx, {
      action: "ATENDIMENTO_CRIADO",
      entity: "Atendimento",
      entityId: created.id,
      actorId: actor.userId,
      actorRole: actor.role,
      details: `Criado a partir do agendamento ${agendamento.id}`,
    });

    const result = await tx.atendimento.findUnique({
      where: { id: created.id },
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
        agendamento: true,
        veterinario: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        pagamento: true,
        historico: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return result;
  });

  return atendimento;
}

async function findAll(actor) {
  const where = {};

  if (actor.role === "cliente") {
    where.tutorId = actor.userId;
  }

  return prisma.atendimento.findMany({
    where,
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
      agendamento: true,
      veterinario: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      pagamento: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function findById(id, actor) {
  const atendimento = await prisma.atendimento.findUnique({
    where: { id },
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
      agendamento: true,
      veterinario: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      pagamento: true,
      historico: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!atendimento) {
    throw new AppError("Atendimento não encontrado", 404);
  }

  if (actor.role === "cliente" && atendimento.tutorId !== actor.userId) {
    throw new AppError("Acesso negado", 403);
  }

  return atendimento;
}

module.exports = {
  updateStatus,
  create,
  findAll,
  findById,
};