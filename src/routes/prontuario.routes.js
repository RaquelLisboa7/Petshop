const { Router } = require("express");
const prontuarioController = require("../controllers/prontuario.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const router = Router();

router.get(
  "/pets/:petId",
  authMiddleware,
  authorize("admin", "atendente", "veterinario", "cliente"),
  prontuarioController.show
);

router.get(
  "/pets/:petId/itens",
  authMiddleware,
  authorize("admin", "atendente", "veterinario", "cliente"),
  prontuarioController.listItems
);

router.post(
  "/pets/:petId/itens",
  authMiddleware,
  authorize("veterinario"),
  prontuarioController.createItem
);

module.exports = router;