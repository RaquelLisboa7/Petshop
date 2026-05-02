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

async function updateStatus(atendimentoId, newStatus, actor) {
  const atendimento = await prisma.atendimento.findUnique({
    where: { id: atendimentoId },
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

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.atendimento.update({
      where: { id: atendimentoId },
      data: { status: newStatus },
    });

    await logAction(tx, {
      action: "ATENDIMENTO_STATUS_ALTERADO",
      entity: "Atendimento",
      entityId: atendimentoId,
      actorId: actor.userId,
      actorRole: actor.role,
      details: `${currentStatus} -> ${newStatus}`,
    });

    return result;
  });

  return updated;
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

    return created;
  });

  return atendimento;
}

async function findAll(actor) {
  const where = {};

  // cliente só vê os próprios atendimentos
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
    },
  });

  if (!atendimento) {
    throw new AppError("Atendimento não encontrado", 404);
  }

  // cliente só acessa o próprio
  if (actor.role === "cliente" && atendimento.tutorId !== actor.userId) {
    throw new AppError("Acesso negado", 403);
  }

  return atendimento;
}

module.exports = {
  updateStatus,
  create,
  findAll,
  findById
};