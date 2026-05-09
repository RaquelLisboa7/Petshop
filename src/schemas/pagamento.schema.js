const { z } = require("zod");

const processPagamentoSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    aprovado: z.boolean(),
    metodo: z.enum(["pix", "cartao", "dinheiro"]).optional(),
    transacaoId: z.string().min(1).optional(),
  }),
});

module.exports = {
  processPagamentoSchema,
};