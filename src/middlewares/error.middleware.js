function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Erro interno no servidor";

  const payload = {
    error: message,
  };

  if (err.details) {
    payload.details = err.details;
  }

  return res.status(statusCode).json(payload);
}

module.exports = errorMiddleware;