const { z } = require("zod");

const createProntuarioItemSchema = z.object({
  tipo: z.enum([
    "consulta",
    "vacina",
    "exame",
    "cirurgia",
    "internacao",
    "tratamento",
    "observacao",
  ]),
  titulo: z.string().trim().min(2, "Título precisa ter pelo menos 2 caracteres"),
  descricao: z.string().trim().max(2000).optional(),
  dataEvento: z.string().datetime().optional(),
});

module.exports = {
  createProntuarioItemSchema,
};