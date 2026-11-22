import { z } from "zod";
import { idParams, objectBody } from "./common.js";
import { goodsItems } from "./goods.schemas.js";

export const createGoodsReceiptBody = objectBody({
  items: goodsItems("nhập"),
  receiptType: z
    .enum(["NORMAL", "OPENING"], {
      error: "Loại phiếu nhập phải là NORMAL hoặc OPENING.",
    })
    .default("NORMAL"),
});

export const goodsReceiptIdParams = idParams("ID phiếu nhập không hợp lệ.");
