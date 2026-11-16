import { z } from "zod";
import { idParams, objectBody, requiredText } from "./common.js";

// price có thể đến dưới dạng số (5000) hoặc chuỗi số ("5000") từ form.
// Chuỗi rỗng, null, boolean KHÔNG được đổi thành 0 (khác z.coerce.number()).
const price = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() !== "" ? Number(value) : value,
  z
    .number({ error: "Giá phải là số không âm" })
    .min(0, "Giá phải là số không âm"),
);

const productFields = {
  name: requiredText("tên sản phẩm"),
  sku: requiredText("SKU"),
  category: requiredText("danh mục"),
  supplier: requiredText("nhà cung cấp"),
  price,
};

// stock không nằm trong body: tồn kho chỉ đổi qua phiếu nhập/xuất.
// Create: stock (nếu client lỡ gửi) bị bỏ qua. Update: gửi stock là lỗi 400.
export const createProductBody = objectBody(productFields);

export const updateProductBody = objectBody({
  ...productFields,
  stock: z
    .never({ error: "Tồn kho chỉ thay đổi qua phiếu nhập/xuất" })
    .optional(),
});

export const productIdParams = idParams("ID sản phẩm không hợp lệ");
