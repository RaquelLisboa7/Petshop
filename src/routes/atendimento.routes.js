const { Router } = require("express");
const atendimentoController = require("../controllers/atendimento.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const router = Router();

router.get("/", authMiddleware, authorize("admin", "atendente"), atendimentoController.index);

router.get("/:id", authMiddleware, authorize("admin", "atendente"), atendimentoController.show);

router.patch(
  "/:id/status",
  authMiddleware,
  authorize("admin", "atendente"),
  atendimentoController.updateStatus
);

router.post(
  "/",
  authMiddleware,
  authorize("admin", "atendente"),
  atendimentoController.create
);

module.exports = router;