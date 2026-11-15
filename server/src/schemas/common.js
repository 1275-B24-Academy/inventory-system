import { z } from "zod";

// Body phải là JSON object. Request không gửi body (req.body = undefined) được coi như {}
// để người dùng nhận lỗi "thiếu trường" thay vì lỗi kỹ thuật.
export const objectBody = (shape) =>
  z.object(shape, { error: "Dữ liệu không hợp lệ" });

// Chuỗi bắt buộc: bỏ khoảng trắng 2 đầu, không được rỗng.
// `label` chỉ để ghép câu thông báo, vd requiredText("tên sản phẩm").
export const requiredText = (label) =>
  z
    .string({ error: `Vui lòng nhập ${label}` })
    .trim()
    .min(1, `Vui lòng nhập ${label}`);

// Param :id trên URL luôn là chuỗi. Chỉ nhận chuỗi toàn chữ số ("12"),
// loại "abc", "1.5", "-3", "0x10" rồi mới đổi sang number.
// z.int() chỉ nhận safe integer, từ chối số thực, NaN và Infinity.
export const idParams = (message) =>
  z.object({
    id: z
      .string()
      .regex(/^\d+$/, message)
      .transform(Number)
      .pipe(z.int().positive(message)),
  });
