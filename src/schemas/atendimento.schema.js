const { z } = require("zod");

const createAtendimentoSchema = z.object({
  body: z.object({
    agendamentoId: z.coerce.number().int().positive(),
  }),
});

const updateStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum([
      "confirmado",
      "em_atendimento",
      "finalizado",
      "cancelado",
    ]),
  }),
});

module.exports = {
  createAtendimentoSchema,
  updateStatusSchema,
};