function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "23505") {
    if (error.constraint === "users_email_key") {
      return res.status(409).json({
        message: "Email đã được sử dụng",
      });
    }

    // Thay tên này nếu ràng buộc SKU của bạn có tên khác.
    if (error.constraint === "products_sku_key") {
      return res.status(409).json({
        message: "SKU đã tồn tại",
      });
    }
  }

  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message: statusCode >= 500 ? "Lỗi server, vui lòng thử lại" : error.message,
  });
}

module.exports = errorHandler;
