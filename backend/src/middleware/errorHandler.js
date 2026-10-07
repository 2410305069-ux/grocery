export function errorHandler(err, req, res, next) {
  console.error(`❌ [Error ${req.method} ${req.url}]:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
}
