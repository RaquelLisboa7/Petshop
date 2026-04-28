const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema, refreshSchema} = require("../validations/auth.validation");
const { prisma } = require("../lib/prisma")

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login",  validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", validate(refreshSchema), authController.logout);

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.user.sub);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

router.get("/admin-area", authMiddleware, authorize("admin"), (req, res) => {
  return res.json({ message: "Área restrita para admin" });
});

router.get("/atendente-area", authMiddleware, authorize("atendente", "admin"), (req, res) => {
  return res.json({ message: "Área restrita para atendente ou admin" });
});


module.exports = router;