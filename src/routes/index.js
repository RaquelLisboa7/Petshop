const { Router } = require("express");
const authRoutes = require("./auth.routes.js");
const atendimentoRoutes = require("./atendimento.routes");
const agendamentoRoutes = require("./agendamento.routes");
const pagamentoRoutes = require("./pagamento.routes");


const router = Router();

router.use("/auth", authRoutes);
router.use("/atendimentos", atendimentoRoutes);
router.use("/agendamentos", agendamentoRoutes);
router.use("/pagamentos", pagamentoRoutes);


module.exports = router;