import { z } from "zod";
import { objectBody } from "./common.js";

const positiveInteger = (message) =>
  z.number({ error: message }).int(message).positive(message);

export const goodsItems = (label) =>
  z
    .array(
      objectBody({
        productId: positiveInteger("ID sản phẩm phải là số nguyên dương."),
        quantity: positiveInteger(`Số lượng ${label} phải là số nguyên dương.`),
      }),
      { error: `Phiếu ${label} phải có ít nhất một sản phẩm.` },
    )
    .min(1, `Phiếu ${label} phải có ít nhất một sản phẩm.`)
    .refine(
      (items) =>
        new Set(items.map((item) => item.productId)).size === items.length,
      {
        message: "Một sản phẩm chỉ được xuất hiện một lần trong phiếu.",
      },
    );
