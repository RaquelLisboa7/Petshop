const { Router } = require("express");

const controller = require("../controllers/agendamento.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  createAgendamentoSchema,
  agendamentoIdSchema,
} = require("../schemas/agendamento.schema");

const router = Router();

/**
 * @swagger
 * /agendamentos:
 *   post:
 *     summary: Cria agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Agendamento criado
 */
router.post(
  "/",
  authMiddleware,
  authorize("admin", "atendente", "cliente"),
  validate(createAgendamentoSchema),
  controller.create
);

/**
 * @swagger
 * /agendamentos:
 *   get:
 *     summary: Lista agendamentos
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 */
router.get("/", authMiddleware, controller.index);

/**
 * @swagger
 * /agendamentos/{id}:
 *   get:
 *     summary: Busca agendamento por ID
 *     tags: [Agendamentos]
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
 *         description: Agendamento encontrado
 *       404:
 *         description: Agendamento não encontrado
 */
router.get(
  "/:id",
  authMiddleware,
  validate(agendamentoIdSchema),
  controller.show
);

/**
 * @swagger
 * /agendamentos/{id}/cancelar:
 *   patch:
 *     summary: Cancela agendamento
 *     tags: [Agendamentos]
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
 *         description: Agendamento cancelado
 */
router.patch(
  "/:id/cancelar",
  authMiddleware,
  validate(agendamentoIdSchema),
  controller.cancel
);

module.exports = router;