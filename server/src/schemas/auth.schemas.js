import { z } from "zod";
import { objectBody, requiredText } from "./common.js";

export const registerBody = objectBody({
  name: requiredText("tên"),
  email: z
    .string({ error: "Vui lòng nhập email" })
    .trim()
    .toLowerCase()
    .min(1, "Vui lòng nhập email")
    .pipe(z.email("Email không hợp lệ")),
  password: z
    .string({ error: "Vui lòng nhập mật khẩu" })
    .min(6, "Mật khẩu phải từ 6 đến 20 ký tự")
    .max(20, "Mật khẩu phải từ 6 đến 20 ký tự"),
  confirmPassword: z
    .string({ error: "Vui lòng nhập mật khẩu xác nhận" })
    .min(1, "Vui lòng nhập mật khẩu xác nhận"),
}).refine((data) => data.password === data.confirmPassword, {
  error: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

// Login không kiểm tra độ dài/định dạng: sai thì service trả 401 chung chung,
// tránh lộ cho người ngoài biết quy tắc đặt mật khẩu.
export const loginBody = objectBody({
  email: z
    .string({ error: "Vui lòng nhập email" })
    .trim()
    .toLowerCase()
    .min(1, "Vui lòng nhập email"),
  password: z
    .string({ error: "Vui lòng nhập mật khẩu" })
    .min(1, "Vui lòng nhập mật khẩu"),
});
