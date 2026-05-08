const prontuarioService = require("../services/prontuario.service");
const { createProntuarioItemSchema } = require("../validations/prontuario.validation");

async function show(req, res, next) {
  try {
    const { petId } = req.params;

    const prontuario = await prontuarioService.getProntuarioByPetId(
      Number(petId),
      {
        userId: Number(req.user.sub),
        role: req.user.role,
      }
    );

    return res.status(200).json(prontuario);
  } catch (error) {
    return next(error);
  }
}

async function listItems(req, res, next) {
  try {
    const { petId } = req.params;

    const items = await prontuarioService.listItemsByPetId(Number(petId), {
      userId: Number(req.user.sub),
      role: req.user.role,
    });

    return res.status(200).json(items);
  } catch (error) {
    return next(error);
  }
}

async function createItem(req, res, next) {
  try {
    const { petId } = req.params;
    const data = createProntuarioItemSchema.parse(req.body);

    const item = await prontuarioService.createItem(Number(petId), {
      userId: Number(req.user.sub),
      role: req.user.role,
    }, data);

    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  show,
  listItems,
  createItem,
};