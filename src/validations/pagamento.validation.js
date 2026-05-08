const { z } = require("zod");

const processPagamentoSchema = z.object({
  aprovado: z.boolean(),
  metodo: z.enum(["pix", "cartao", "dinheiro"]).optional(),
  transacaoId: z.string().min(3).optional(),
});

module.exports = {
  processPagamentoSchema,
};