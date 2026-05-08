const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema, refreshSchema} = require("../validations/auth.validation");

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Maria
 *               email:
 *                 type: string
 *                 example: maria@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 example: cliente
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */

router.post("/register", validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Faz login e retorna tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: maria@email.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login",  validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Gera novo access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens renovados
 *       401:
 *         description: Refresh token inválido
 */
router.post("/refresh", validate(refreshSchema), authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Revoga o refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       204:
 *         description: Logout realizado
 *       401:
 *         description: Refresh token inválido
 */
router.post("/logout", validate(refreshSchema), authController.logout);

router.get("/me", authMiddleware, authController.me);

router.get("/admin-area", authMiddleware, authorize("admin"), (req, res) => {
  return res.json({ message: "Área restrita para admin" });
});

router.get("/atendente-area", authMiddleware, authorize("atendente", "admin"), (req, res) => {
  return res.json({ message: "Área restrita para atendente ou admin" });
});


module.exports = router;