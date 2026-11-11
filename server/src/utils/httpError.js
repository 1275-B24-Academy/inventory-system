// Tạo Error kèm HTTP status code. errorHandler đọc error.statusCode để trả response;
// không có statusCode thì coi là lỗi 500.
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export { createError };
