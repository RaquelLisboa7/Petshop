const { Router } = require("express");
const authRoutes = require("./auth.routes.js");
const atendimentoRoutes = require("./atendimento.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/atendimentos", atendimentoRoutes);

module.exports = router;