const { Router } = require("express");

const pagamentoController = require("../controllers/pagamento.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  processPagamentoSchema,
} = require("../schemas/pagamento.schema");

const router = Router();
/**
 * @swagger
 * /pagamentos:
 *   get:
 *     summary: Lista pagamentos
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 */
router.get(
  "/",
  authMiddleware,
  authorize("admin", "atendente", "veterinario", "cliente"),
  pagamentoController.index
);

/**
 * @swagger
 * /pagamentos/{id}:
 *   get:
 *     summary: Busca pagamento por ID
 *     tags: [Pagamentos]
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
 *         description: Pagamento encontrado
 */
router.get(
  "/:id",
  authMiddleware,
  authorize("admin", "atendente", "veterinario", "cliente"),
  pagamentoController.show
);

/**
 * @swagger
 * /pagamentos/{id}/processar:
 *   patch:
 *     summary: Processa pagamento
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pagamento processado
 */
router.patch("/:id/processar", authMiddleware, authorize("admin", "atendente"), validate(processPagamentoSchema), pagamentoController.process);

module.exports = router;