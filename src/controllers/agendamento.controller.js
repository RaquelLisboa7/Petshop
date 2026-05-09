const agendamentoService = require("../services/agendamento.service");

async function create(req, res, next) {
  try {
    const data = req.validated.body;

    const agendamento = await agendamentoService.create({
      tutorId: Number(req.user.sub),
      petId: data.petId,
      dataHora: data.dataHora,
      tipo: data.tipo,
      observacao: data.observacao,
    });

    return res.status(201).json(agendamento);
  } catch (error) {
    return next(error);
  }
}

async function cancel(req, res, next) {
  try {
    const { id } = req.validated.params;

    const agendamento = await agendamentoService.cancel({
      agendamentoId: id,
      actor: {
        userId: Number(req.user.sub),
        role: req.user.role,
      },
    });

    return res.status(200).json(agendamento);
  } catch (error) {
    return next(error);
  }
}

async function show(req, res, next) {
  try {
    const { id } = req.validated.params;

    const agendamento = await agendamentoService.findById(id, {
      userId: Number(req.user.sub),
      role: req.user.role,
    });

    return res.status(200).json(agendamento);
  } catch (error) {
    return next(error);
  }
}



async function index(req, res, next) {
  try {
    const agendamentos = await agendamentoService.findAll({
      userId: Number(req.user.sub),
      role: req.user.role,
    });

    return res.status(200).json(agendamentos);
  } catch (error) {
    return next(error);
  }
}



module.exports = {
  create,
  cancel,
  index,
  show,
};