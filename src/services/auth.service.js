const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../lib/prisma");
const AppError = require("../errors/app.error");
const { generateRefreshToken, hashToken } = require("../utils/token");

const REFRESH_TOKEN_DAYS = 7;

async function register({ name, email, password, role = "cliente" }) {
  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) {
    throw new AppError("Esse email já está cadastrado", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("Credenciais inválidas", 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new AppError("Credenciais inválidas", 401);
  }

  const accessToken = jwt.sign(
  { sub: String(user.id), role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw new AppError("Refresh token não fornecido", 401);
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (
    !storedToken ||
    storedToken.revokedAt ||
    storedToken.expiresAt < new Date()
  ) {
    throw new AppError("Refresh token inválido", 401);
  }

  const newAccessToken = jwt.sign(
    { sub: String(storedToken.user.id), role: storedToken.user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRefreshToken);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: storedToken.userId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

async function logout({ refreshToken }) {
  if (!refreshToken) {
    throw new AppError("Refresh token não fornecido", 401);
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!storedToken || storedToken.revokedAt) {
    throw new AppError("Refresh token inválido", 401);
  }

  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });

  return true;
}


module.exports = {  
  register,
  login,
  refresh,
  logout
};