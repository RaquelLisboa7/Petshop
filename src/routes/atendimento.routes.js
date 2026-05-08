const { Router } = require("express");
const atendimentoController = require("../controllers/atendimento.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorize("admin", "atendente", "veterinario"),
  atendimentoController.index
);

router.get(
  "/:id",
  authMiddleware,
  authorize("admin", "atendente", "veterinario"),
  atendimentoController.show
);

router.patch(
  "/:id/status",
  authMiddleware,
  authorize("admin", "atendente", "veterinario"),
  atendimentoController.updateStatus
);

router.post(
  "/",
  authMiddleware,
  authorize("admin", "atendente"),
  atendimentoController.create
);

module.exports = router;