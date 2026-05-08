const request = require("supertest");
const app = require("../src/app");
const { prisma } = require("../src/lib/prisma");

describe("Fluxo de atendimento e pagamento", () => {
  beforeEach(async () => {
    await prisma.historicoAtendimento.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.pagamento.deleteMany();
    await prisma.atendimento.deleteMany();
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

  async function createPet(userId) {
    return prisma.pet.create({
      data: {
        name: "Rex",
        species: "cão",
        tutorId: userId,
      },
    });
  }

  async function createAndLoginUser(role = "cliente") {
    const email = `${role}_${Date.now()}@email.com`;

    await request(app).post("/auth/register").send({
      name: role,
      email,
      password: "123456",
      role,
    });

    const login = await request(app).post("/auth/login").send({
      email,
      password: "123456",
    });

    return login.body;
  }

  async function createConfirmedAgendamento(token, tutorId) {
    const pet = await createPet(tutorId);
    const dataHora = getFutureDate(3);

    const agendamentoRes = await request(app)
      .post("/agendamentos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: pet.id,
        dataHora,
      });

    expect(agendamentoRes.status).toBe(201);

    const agendamento = await prisma.agendamento.update({
      where: { id: agendamentoRes.body.id },
      data: { status: "confirmado" },
    });

    return { agendamento, pet };
  }

  it("deve criar atendimento e pagamento pendente a partir de agendamento confirmado", async () => {
    const cliente = await createAndLoginUser("cliente");
    const admin = await createAndLoginUser("admin");

    const { agendamento } = await createConfirmedAgendamento(
      cliente.accessToken,
      cliente.user.id
    );

    const atendimentoRes = await request(app)
      .post("/atendimentos")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({
        agendamentoId: agendamento.id,
      });

    expect(atendimentoRes.status).toBe(201);
    expect(atendimentoRes.body.status).toBe("agendado");
    expect(atendimentoRes.body.pagamento).toBeTruthy();
    expect(atendimentoRes.body.pagamento.status).toBe("pendente");
    expect(atendimentoRes.body.historico.length).toBeGreaterThan(0);
  });

  it("não deve avançar atendimento para em_atendimento sem pagamento aprovado", async () => {
    const cliente = await createAndLoginUser("cliente");
    const admin = await createAndLoginUser("admin");

    const { agendamento } = await createConfirmedAgendamento(
      cliente.accessToken,
      cliente.user.id
    );

    const atendimentoRes = await request(app)
      .post("/atendimentos")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({
        agendamentoId: agendamento.id,
      });

    expect(atendimentoRes.status).toBe(201);

    const confirmed = await request(app)
      .patch(`/atendimentos/${atendimentoRes.body.id}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "confirmado" });

    expect(confirmed.status).toBe(200);

    const blocked = await request(app)
      .patch(`/atendimentos/${atendimentoRes.body.id}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "em_atendimento" });

    expect(blocked.status).toBe(409);
  });

  it("deve aprovar pagamento e liberar avanço do atendimento", async () => {
    const cliente = await createAndLoginUser("cliente");
    const admin = await createAndLoginUser("admin");

    const { agendamento } = await createConfirmedAgendamento(
      cliente.accessToken,
      cliente.user.id
    );

    const atendimentoRes = await request(app)
      .post("/atendimentos")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({
        agendamentoId: agendamento.id,
      });

    expect(atendimentoRes.status).toBe(201);

    const pagamentoId = atendimentoRes.body.pagamento.id;

    const pagamentoRes = await request(app)
      .patch(`/pagamentos/${pagamentoId}/processar`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({
        aprovado: true,
        metodo: "pix",
        transacaoId: "TX-001",
      });

    expect(pagamentoRes.status).toBe(200);
    expect(pagamentoRes.body.status).toBe("pago");

    const confirmado = await request(app)
    .patch(`/atendimentos/${atendimentoRes.body.id}/status`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ status: "confirmado" });

    expect(confirmado.status).toBe(200);

    const toEmAtendimento = await request(app)
    .patch(`/atendimentos/${atendimentoRes.body.id}/status`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ status: "em_atendimento" });

    expect(toEmAtendimento.status).toBe(200);
    expect(toEmAtendimento.body.status).toBe("em_atendimento");

    const toFinalizado = await request(app)
      .patch(`/atendimentos/${atendimentoRes.body.id}/status`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ status: "finalizado" });

    expect(toFinalizado.status).toBe(200);
    expect(toFinalizado.body.status).toBe("finalizado");
  });

  it("deve recusar pagamento e manter status recusado", async () => {
    const cliente = await createAndLoginUser("cliente");
    const admin = await createAndLoginUser("admin");

    const { agendamento } = await createConfirmedAgendamento(
      cliente.accessToken,
      cliente.user.id
    );

    const atendimentoRes = await request(app)
      .post("/atendimentos")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({
        agendamentoId: agendamento.id,
      });

    expect(atendimentoRes.status).toBe(201);

    const pagamentoId = atendimentoRes.body.pagamento.id;

    const pagamentoRes = await request(app)
      .patch(`/pagamentos/${pagamentoId}/processar`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({
        aprovado: false,
        metodo: "cartao",
        transacaoId: "TX-002",
      });

    expect(pagamentoRes.status).toBe(200);
    expect(pagamentoRes.body.status).toBe("recusado");
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});