require("dotenv/config");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  await prisma.historicoAtendimento.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.atendimento.deleteMany();
  await prisma.prontuarioItem.deleteMany();
  await prisma.prontuario.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@petshop.com",
      password,
      role: "admin",
    },
  });

  const veterinario = await prisma.user.create({
    data: {
      name: "Veterinário",
      email: "vet@petshop.com",
      password,
      role: "veterinario",
    },
  });

  const atendente = await prisma.user.create({
    data: {
      name: "Atendente",
      email: "atendente@petshop.com",
      password,
      role: "atendente",
    },
  });

  const cliente = await prisma.user.create({
    data: {
      name: "Cliente",
      email: "cliente@petshop.com",
      password,
      role: "cliente",
    },
  });

  const pet = await prisma.pet.create({
    data: {
      name: "Rex",
      species: "cão",
      breed: "SRD",
      sex: "macho",
      castrated: true,
      tutorId: cliente.id,
    },
  });

  const agendamento = await prisma.agendamento.create({
    data: {
      tutorId: cliente.id,
      petId: pet.id,
      tipo: "consulta",
      dataHora: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "confirmado",
      observacao: "Consulta inicial",
      createdBy: cliente.id,
    },
  });

  const atendimento = await prisma.atendimento.create({
    data: {
      agendamentoId: agendamento.id,
      petId: pet.id,
      tutorId: cliente.id,
      veterinarioId: veterinario.id,
      status: "agendado",
    },
  });

  await prisma.pagamento.create({
    data: {
      atendimentoId: atendimento.id,
      status: "pendente",
      valor: 120,
      createdById: atendente.id,
    },
  });

  await prisma.historicoAtendimento.create({
    data: {
      atendimentoId: atendimento.id,
      tipo: "status",
      descricao: "Atendimento criado com status agendado",
      paraStatus: "agendado",
      actorId: atendente.id,
    },
  });

  await prisma.prontuario.create({
    data: {
      petId: pet.id,
    },
  });

  console.log("Seed executado com sucesso");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });