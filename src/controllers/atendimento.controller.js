const atendimentoService = require("../services/atendimento.service");
const { createAtendimentoSchema, updateStatusSchema } = require("../validations/atendimento.validation");


async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const data = updateStatusSchema.parse(req.body);

    const updated = await atendimentoService.updateStatus(Number(id), data.status);

    return res.status(200).json(updated);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = createAtendimentoSchema.parse(req.body);
    const atendimento = await atendimentoService.create(data);
    return res.status(201).json(atendimento);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  updateStatus,
};