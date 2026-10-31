export function errorHandler(err, _req, res, _next) {
  if (err.status) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }
  console.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL",
      message: "Something went wrong",
    },
  });
}
