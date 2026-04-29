const { z } = require("zod");

const updateStatusSchema = z.object({
  status: z.enum([
    "agendado",
    "confirmado",
    "em_atendimento",
    "finalizado",
    "cancelado",
  ]),
});

const createAtendimentoSchema = z.object({
  agendamentoId: z.number().int().positive(),
});

module.exports = {
  updateStatusSchema,
  createAtendimentoSchema,
};