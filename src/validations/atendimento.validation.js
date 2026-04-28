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

module.exports = {
  updateStatusSchema,
};