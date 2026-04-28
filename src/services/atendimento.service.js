const { prisma } = require("../lib/prisma");
const AppError = require("../errors/app.error");

const statusFlow = {
  agendado: ["confirmado", "cancelado"],
  confirmado: ["em_atendimento", "cancelado"],
  em_atendimento: ["finalizado", "cancelado"],
  finalizado: [],
  cancelado: [],
};

async function updateStatus(atendimentoId, newStatus) {
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

  // bloqueia se já estiver finalizado ou cancelado
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

  const updated = await prisma.atendimento.update({
    where: { id: atendimentoId },
    data: { status: newStatus },
  });

  return updated;
}

module.exports = {
  updateStatus,
};