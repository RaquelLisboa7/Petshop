const { z } = require("zod");
const { Router } = require("express");

const router = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Nome obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    role: z
      .enum(["admin", "atendente", "veterinario", "cliente"])
      .optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha inválida"),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
};