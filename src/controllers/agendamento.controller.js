const agendamentoService = require("../services/agendamento.service");
const { createAgendamentoSchema } = require("../validations/agendamento.validation");

async function create(req, res, next) {
  try {
    const data = createAgendamentoSchema.parse(req.body);

    const agendamento = await agendamentoService.create({
      userId: Number(req.user.sub),
      dataHora: data.dataHora,
    });

    return res.status(201).json(agendamento);
  } catch (error) {
    return next(error);
  }
}

module.exports = { create };