const { prisma } = require("../lib/prisma");
const AppError = require("../errors/app.error");
const { logAction } = require("./audit-log.service");

async function getProntuarioByPetId(petId, actor) {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      tutor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      prontuario: {
        include: {
          itens: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!pet) {
    throw new AppError("Pet não encontrado", 404);
  }

  if (actor.role === "cliente" && pet.tutorId !== actor.userId) {
    throw new AppError("Acesso negado", 403);
  }

  return pet;
}

async function listItemsByPetId(petId, actor) {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    select: {
      id: true,
      tutorId: true,
      name: true,
      species: true,
      breed: true,
      sex: true,
      castrated: true,
      prontuario: {
        include: {
          itens: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!pet) {
    throw new AppError("Pet não encontrado", 404);
  }

  if (actor.role === "cliente" && pet.tutorId !== actor.userId) {
    throw new AppError("Acesso negado", 403);
  }

  return pet.prontuario?.itens ?? [];
}

async function createItem(petId, actor, data) {
  if (actor.role !== "veterinario") {
    throw new AppError("Apenas veterinário pode registrar prontuário", 403);
  }

  return prisma.$transaction(async (tx) => {
    const pet = await tx.pet.findUnique({
      where: { id: petId },
      include: {
        prontuario: true,
      },
    });

    if (!pet) {
      throw new AppError("Pet não encontrado", 404);
    }

    const atendimentoAtivo = await tx.atendimento.findFirst({
      where: {
        petId,
        status: {
          in: ["confirmado", "em_atendimento"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!atendimentoAtivo) {
      throw new AppError(
        "Só é possível registrar prontuário com atendimento ativo",
        409
      );
    }

    let prontuarioId = pet.prontuario?.id;

    if (!prontuarioId) {
      const prontuario = await tx.prontuario.create({
        data: {
          petId,
        },
      });

      prontuarioId = prontuario.id;
    }

    const item = await tx.prontuarioItem.create({
      data: {
        prontuarioId,
        tipo: data.tipo,
        titulo: data.titulo,
        descricao: data.descricao,
        dataEvento: data.dataEvento ? new Date(data.dataEvento) : null,
        createdById: actor.userId,
      },
      include: {
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
        atendimentoId: atendimentoAtivo.id,
        tipo: "observacao",
        descricao: `Prontuário atualizado: ${data.titulo}`,
        actorId: actor.userId,
      },
    });

    await logAction(tx, {
      action: "PRONTUARIO_ITEM_CRIADO",
      entity: "ProntuarioItem",
      entityId: item.id,
      actorId: actor.userId,
      actorRole: actor.role,
      details: `${data.tipo} - ${data.titulo}`,
    });

    return item;
  });
}

module.exports = {
  getProntuarioByPetId,
  listItemsByPetId,
  createItem,
};