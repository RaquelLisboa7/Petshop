const atendimentoService = require("../services/atendimento.service");
const { updateStatusSchema } = require("../validations/atendimento.validation");

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

module.exports = {
  updateStatus,
};