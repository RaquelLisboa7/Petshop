function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    error: err.isOperational ? err.message : "Erro interno no servidor",
  });
}

module.exports = errorMiddleware;