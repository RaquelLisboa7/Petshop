const { Router } = require("express");
const controller = require("../controllers/agendamento.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

router.post("/", authMiddleware, controller.create);

module.exports = router;