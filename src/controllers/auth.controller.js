const authService = require("../services/auth.service");
const { registerSchema, loginSchema } = require("../validations/auth.validation");

async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const user = await authService.register(data);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh({ refreshToken });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await authService.logout({ refreshToken });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout
};