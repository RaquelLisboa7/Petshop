const { Router } = require("express");
const controller = require("../controllers/agendamento.controller");
const authMiddleware = require("../middlewares/auth.middleware");

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
router.post("/", authMiddleware, controller.create);

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
router.patch("/:id/cancelar", authMiddleware, controller.cancel);

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
router.get("/:id", authMiddleware, controller.show);

module.exports = router;