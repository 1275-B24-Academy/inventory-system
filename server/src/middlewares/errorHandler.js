function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  // P2002: Prisma báo vi phạm UNIQUE. meta.modelName cho biết lỗi ở bảng nào.
  if (error.code === "P2002") {
    if (error.meta?.modelName === "User") {
      return res.status(409).json({
        message: "Email đã được sử dụng",
      });
    }

    if (error.meta?.modelName === "Product") {
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

export default errorHandler;
