const { z } = require("zod");

const createAgendamentoSchema = z.object({
  body: z.object({
    petId: z.coerce.number().int().positive(),
    dataHora: z.string().datetime(),
    tipo: z
      .enum([
        "consulta",
        "retorno",
        "vacina",
        "cirurgia",
        "exame",
        "internacao",
      ])
      .optional(),
    observacao: z.string().max(500).optional(),
  }),
});

const agendamentoIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

module.exports = {
  createAgendamentoSchema,
  agendamentoIdSchema,
};