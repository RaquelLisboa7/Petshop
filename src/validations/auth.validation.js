const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter pelo menos 2 caracteres"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
  role: z.enum(["admin", "atendente", "cliente"]).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20, "Refresh token inválido"),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema
};