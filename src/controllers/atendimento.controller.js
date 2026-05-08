const atendimentoService = require("../services/atendimento.service");
const {
  createAtendimentoSchema,
  updateStatusSchema,
} = require("../validations/atendimento.validation");

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const data = updateStatusSchema.parse(req.body);

    const updated = await atendimentoService.updateStatus(
      Number(id),
      data.status,
      {
        userId: Number(req.user.sub),
        role: req.user.role,
      }
    );

    return res.status(200).json(updated);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = createAtendimentoSchema.parse(req.body);

    const atendimento = await atendimentoService.create({
      agendamentoId: data.agendamentoId,
      actor: {
        userId: Number(req.user.sub),
        role: req.user.role,
      },
    });

    return res.status(201).json(atendimento);
  } catch (error) {
    return next(error);
  }
}

async function index(req, res, next) {
  try {
    const atendimentos = await atendimentoService.findAll({
      userId: Number(req.user.sub),
      role: req.user.role,
    });

    return res.status(200).json(atendimentos);
  } catch (error) {
    return next(error);
  }
}

async function show(req, res, next) {
  try {
    const { id } = req.params;

    const atendimento = await atendimentoService.findById(Number(id), {
      userId: Number(req.user.sub),
      role: req.user.role,
    });

    return res.status(200).json(atendimento);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  updateStatus,
  index,
  show,
};