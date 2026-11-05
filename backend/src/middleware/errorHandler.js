function errorHandler(err, req, res, next) {
  console.error('Erro:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  const response = {
    error: message,
    statusCode,
  };

  if (Array.isArray(err.errors) && err.errors.length > 0) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
