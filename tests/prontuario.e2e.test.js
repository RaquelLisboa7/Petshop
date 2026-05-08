const request = require("supertest");
const app = require("../src/app");
const { prisma } = require("../src/lib/prisma");

describe("Fluxo de prontuário", () => {
  beforeEach(async () => {
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
  });

  function getFutureDate(hoursAhead = 1) {
    return new Date(
      Date.now() +
        hoursAhead * 60 * 60 * 1000 +
        Math.floor(Math.random() * 60000)
    ).toISOString();
  }

  async function createAndLoginUser(role = "cliente") {
  const email = `${role}_${Date.now()}@email.com`;

  const register = await request(app).post("/auth/register").send({
    name: role,
    email,
    password: "123456",
    role,
  });

  expect(register.status).toBe(201);

  const login = await request(app).post("/auth/login").send({
    email,
    password: "123456",
  });

  expect(login.status).toBe(200);
  expect(login.body.accessToken).toBeTruthy();

  return login.body;
}

  async function createPet(userId) {
    return prisma.pet.create({
      data: {
        name: "Rex",
        species: "cão",
        tutorId: userId,
      },
    });
  }

  async function createConfirmedAgendamento(token, petId) {
    const agendamentoRes = await request(app)
      .post("/agendamentos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId,
        dataHora: getFutureDate(3),
      });

    expect(agendamentoRes.status).toBe(201);

    await prisma.agendamento.update({
      where: { id: agendamentoRes.body.id },
      data: { status: "confirmado" },
    });

    return agendamentoRes.body;
  }

  async function createAtendimentoFromAgendamento(adminToken, agendamentoId) {
    const atendimentoRes = await request(app)
      .post("/atendimentos")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ agendamentoId });

    expect(atendimentoRes.status).toBe(201);

    await prisma.atendimento.update({
      where: { id: atendimentoRes.body.id },
      data: { status: "confirmado" },
    });

    return atendimentoRes.body;
  }

  it("veterinário deve criar item no prontuário com atendimento ativo", async () => {
    const cliente = await createAndLoginUser("cliente");
    const admin = await createAndLoginUser("admin");
    const veterinario = await createAndLoginUser("veterinario");

    const pet = await createPet(cliente.user.id);
    const agendamento = await createConfirmedAgendamento(
      cliente.accessToken,
      pet.id
    );
    await createAtendimentoFromAgendamento(admin.accessToken, agendamento.id);

    const atendimento = await prisma.atendimento.findFirst({
      where: { petId: pet.id },
      orderBy: { createdAt: "desc" },
    });

    const response = await request(app)
      .post(`/prontuarios/pets/${pet.id}/itens`)
      .set("Authorization", `Bearer ${veterinario.accessToken}`)
      .send({
        tipo: "consulta",
        titulo: "Consulta inicial",
        descricao: "Animal com apetite reduzido",
      });

    expect(response.status).toBe(201);
    expect(response.body.titulo).toBe("Consulta inicial");

    const prontuario = await request(app)
      .get(`/prontuarios/pets/${pet.id}`)
      .set("Authorization", `Bearer ${veterinario.accessToken}`);

    expect(prontuario.status).toBe(200);
    expect(prontuario.body.prontuario.itens.length).toBe(1);
    expect(prontuario.body.prontuario.itens[0].titulo).toBe("Consulta inicial");

    const historico = await prisma.historicoAtendimento.findMany({
      where: { atendimentoId: atendimento.id },
    });

    expect(historico.length).toBeGreaterThan(0);
  });

  it("cliente deve visualizar o prontuário do próprio pet", async () => {
    const cliente = await createAndLoginUser("cliente");
    const admin = await createAndLoginUser("admin");

    const pet = await createPet(cliente.user.id);
    const agendamento = await createConfirmedAgendamento(
      cliente.accessToken,
      pet.id
    );
    await createAtendimentoFromAgendamento(admin.accessToken, agendamento.id);

    const veterinario = await createAndLoginUser("veterinario");

    const createItemRes = await request(app)
      .post(`/prontuarios/pets/${pet.id}/itens`)
      .set("Authorization", `Bearer ${veterinario.accessToken}`)
      .send({
        tipo: "vacina",
        titulo: "Vacina V8",
        descricao: "Aplicação anual",
      });

    expect(createItemRes.status).toBe(201);

    const response = await request(app)
      .get(`/prontuarios/pets/${pet.id}`)
      .set("Authorization", `Bearer ${cliente.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(pet.id);
    expect(response.body.prontuario.itens.length).toBe(1);
  });

  it("cliente não deve criar item no prontuário", async () => {
    const cliente = await createAndLoginUser("cliente");
    const admin = await createAndLoginUser("admin");

    const pet = await createPet(cliente.user.id);
    const agendamento = await createConfirmedAgendamento(
      cliente.accessToken,
      pet.id
    );
    await createAtendimentoFromAgendamento(admin.accessToken, agendamento.id);

    const response = await request(app)
      .post(`/prontuarios/pets/${pet.id}/itens`)
      .set("Authorization", `Bearer ${cliente.accessToken}`)
      .send({
        tipo: "observacao",
        titulo: "Tentativa indevida",
        descricao: "Não deveria passar",
      });

    expect(response.status).toBe(403);
  });

  it("não deve criar item sem atendimento ativo", async () => {
    const veterinario = await createAndLoginUser("veterinario");
    const cliente = await createAndLoginUser("cliente");
    const pet = await createPet(cliente.user.id);

    const response = await request(app)
      .post(`/prontuarios/pets/${pet.id}/itens`)
      .set("Authorization", `Bearer ${veterinario.accessToken}`)
      .send({
        tipo: "consulta",
        titulo: "Sem atendimento",
        descricao: "Deve falhar",
      });

    expect(response.status).toBe(409);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});