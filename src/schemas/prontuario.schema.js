const { z } = require("zod");

const createProntuarioItemSchema = z.object({
  params: z.object({
    petId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    tipo: z.enum([
      "consulta",
      "vacina",
      "exame",
      "cirurgia",
      "internacao",
      "tratamento",
      "observacao",
    ]),
    titulo: z.string().min(3).max(120),
    descricao: z.string().min(5).max(3000).optional(),
    dataEvento: z.string().datetime().optional(),
  }),
});


const prontuarioIdSchema = z.object({
  params: z.object({
    petId: z.coerce.number().int().positive(),
  }),
});

module.exports = {
  createProntuarioItemSchema,
  prontuarioIdSchema,
};