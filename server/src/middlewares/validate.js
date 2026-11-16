import { createError } from "../utils/httpError.js";

// validate({ body, params }) kiểm tra request bằng schema Zod, đặt SAU requireRoles
// (người không có quyền nhận 403 trước, không biết schema của ta).
//
// - Hợp lệ: kết quả đã parse (đã trim, đổi sang number, gắn default...) nằm ở
//   req.validated.body / req.validated.params. Controller đọc từ đó, KHÔNG đọc req.body.
//   Lý do không ghi đè req.*: Express 5 không cho gán lại req.query.
// - Không hợp lệ: gọi next(error 400). error.message là lỗi đầu tiên (errorHandler trả
//   cho client), error.details là toàn bộ danh sách lỗi để #54 đưa vào response.
function validate(schemas = {}) {
  return function (req, res, next) {
    const validated = {};
    const details = [];

    for (const source of ["params", "query", "body"]) {
      const schema = schemas[source];
      if (!schema) continue;

      // Express 5: req.body là undefined khi request không có body.
      const input = source === "body" ? (req.body ?? {}) : req[source];
      const result = schema.safeParse(input);

      if (result.success) {
        validated[source] = result.data;
      } else {
        for (const issue of result.error.issues) {
          details.push({
            in: source,
            path: issue.path.join("."),
            message: issue.message,
          });
        }
      }
    }

    if (details.length > 0) {
      const error = createError(details[0].message, 400);
      error.details = details;
      return next(error);
    }

    req.validated = { ...req.validated, ...validated };
    return next();
  };
}

export default validate;
