const { Router } = require("express");

const prontuarioController = require("../controllers/prontuario.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  prontuarioIdSchema,
  createProntuarioItemSchema,
} = require("../schemas/prontuario.schema");

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
  validate(prontuarioIdSchema),
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
  validate(prontuarioIdSchema),
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
router.post("/pets/:petId/itens", authMiddleware, authorize("veterinario"), validate(createProntuarioItemSchema), prontuarioController.createItem);

module.exports = router;