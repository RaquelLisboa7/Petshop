const { z } = require("zod");

const createAgendamentoSchema = z.object({
  dataHora: z.string().datetime(),
});

module.exports = { createAgendamentoSchema };