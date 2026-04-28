const { Router } = require("express");
const atendimentoController = require("../controllers/atendimento.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const router = Router();

router.patch(
  "/:id/status",
  authMiddleware,
  authorize("admin", "atendente"),
  atendimentoController.updateStatus
);

module.exports = router;