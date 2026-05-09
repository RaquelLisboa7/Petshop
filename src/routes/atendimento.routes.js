const { Router } = require("express");

const atendimentoController = require("../controllers/atendimento.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  createAtendimentoSchema,
  updateStatusSchema,
} = require("../schemas/atendimento.schema");

const router = Router();


/**
 * @swagger
 * /atendimentos:
 *   get:
 *     summary: Lista atendimentos
 *     tags: [Atendimentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de atendimentos
 */

router.get("/", authMiddleware, authorize("admin", "atendente", "veterinario"), atendimentoController.index);

/**
 * @swagger
 * /atendimentos/{id}:
 *   get:
 *     summary: Busca atendimento por ID
 *     tags: [Atendimentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atendimento encontrado
 */
router.get("/:id", authMiddleware, authorize("admin", "atendente", "veterinario"), atendimentoController.show);

/**
 * @swagger
 * /atendimentos/{id}/status:
 *  *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: em_atendimento
 *   patch:
 *     summary: Atualiza status do atendimento
 *     tags: [Atendimentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status atualizado
 */
router.patch("/:id/status", authMiddleware, authorize("admin", "atendente", "veterinario"), validate(updateStatusSchema), atendimentoController.updateStatus);

/**
 * @swagger
 * /atendimentos:
 *   post:
 *     summary: Cria atendimento a partir de agendamento confirmado
 *     tags: [Atendimentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agendamentoId
 *             properties:
 *               agendamentoId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Atendimento criado
 */
router.post("/", authMiddleware, authorize("admin", "atendente"), validate(createAtendimentoSchema), atendimentoController.create);

module.exports = router;