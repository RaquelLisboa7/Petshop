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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
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
        userId: agendamento.userId,
        agendamentoId: agendamento.id,
        status: "agendado",
      },
      include: {
        user: true,
        agendamento: true,
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

module.exports = {
  updateStatus,
  create,
};