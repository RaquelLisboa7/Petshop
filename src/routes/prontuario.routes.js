const { Router } = require("express");
const prontuarioController = require("../controllers/prontuario.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const router = Router();


/**
 * @swagger
 * /prontuarios/pets/{petId}:
 *   get:
 *     summary: Busca prontuário do pet
 *     tags: [Prontuarios]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/pets/:petId",
  authMiddleware,
  authorize("admin", "atendente", "veterinario", "cliente"),
  prontuarioController.show
);

/**
 * @swagger
 * /prontuarios/pets/{petId}/itens:
 *   get:
 *     summary: Lista itens do prontuário do pet
 *     tags: [Prontuarios]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/pets/:petId/itens",
  authMiddleware,
  authorize("admin", "atendente", "veterinario", "cliente"),
  prontuarioController.listItems
);

/**
 * @swagger
 * /prontuarios/pets/{petId}/itens:
 *   post:
 *     summary: Adiciona item ao prontuário
 *     tags: [Prontuarios]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/pets/:petId/itens",
  authMiddleware,
  authorize("veterinario"),
  prontuarioController.createItem
);

module.exports = router;