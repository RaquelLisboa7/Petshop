const { prisma } = require("../lib/prisma");
const AppError = require("../errors/app.error");

async function create({ userId, dataHora }) {
  const date = new Date(dataHora);

  return await prisma.$transaction(async (tx) => {
    const conflito = await tx.agendamento.findFirst({
      where: {
        dataHora: date,
        status: {
         in: ["criado", "confirmado"],
        },
      },
    });

    if (conflito) {
      throw new AppError("Horário já ocupado", 409);
    }

    const agendamento = await tx.agendamento.create({
      data: {
        userId,
        dataHora: date,
        status: "criado",
      },
    });

    return agendamento;
  });
}

module.exports = { create };