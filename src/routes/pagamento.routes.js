const { Router } = require("express");
const pagamentoController = require("../controllers/pagamento.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorize("admin", "atendente", "veterinario", "cliente"),
  pagamentoController.index
);

router.get(
  "/:id",
  authMiddleware,
  authorize("admin", "atendente", "veterinario", "cliente"),
  pagamentoController.show
);

router.patch(
  "/:id/processar",
  authMiddleware,
  authorize("admin", "atendente"),
  pagamentoController.process
);

module.exports = router;