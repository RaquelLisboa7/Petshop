const { z } = require("zod");

const createAgendamentoSchema = z.object({
  petId: z.number().int().positive(),
  dataHora: z.string().datetime(),
  tipo: z.enum([
    "consulta",
    "retorno",
    "vacina",
    "cirurgia",
    "exame",
    "internacao",
  ]).optional(),
  observacao: z.string().trim().max(500).optional(),
});

const cancelAgendamentoSchema = z.object({});

module.exports = {
  createAgendamentoSchema,
  cancelAgendamentoSchema,
};