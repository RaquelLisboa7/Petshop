const pagamentoService = require("../services/pagamento.service");
const { processPagamentoSchema } = require("../validations/pagamento.validation");

async function index(req, res, next) {
  try {
    const pagamentos = await pagamentoService.findAll({
      userId: Number(req.user.sub),
      role: req.user.role,
    });

    return res.status(200).json(pagamentos);
  } catch (error) {
    return next(error);
  }
}

async function show(req, res, next) {
  try {
    const { id } = req.params;

    const pagamento = await pagamentoService.findById(Number(id), {
      userId: Number(req.user.sub),
      role: req.user.role,
    });

    return res.status(200).json(pagamento);
  } catch (error) {
    return next(error);
  }
}

async function process(req, res, next) {
  try {
    const { id } = req.params;
    const data = processPagamentoSchema.parse(req.body);

    const pagamento = await pagamentoService.process({
      pagamentoId: Number(id),
      actor: {
        userId: Number(req.user.sub),
        role: req.user.role,
      },
      aprovado: data.aprovado,
      metodo: data.metodo,
      transacaoId: data.transacaoId,
    });

    return res.status(200).json(pagamento);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  index,
  show,
  process,
};