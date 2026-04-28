function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Erro interno no servidor";

  return res.status(statusCode).json({
    error: message,
  });
}

module.exports = errorMiddleware;