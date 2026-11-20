import express from "express";
import requireRoles from "../middlewares/requireRoles.js";
import requireLogin from "../middlewares/requireLogin.js";
import loadCurrentUser from "../middlewares/loadCurrentUser.js";
import { userRepository, goodsReceiptController } from "../container.js";
import validate from "../middlewares/validate.js";
import {
  createGoodsReceiptBody,
  goodsReceiptIdParams,
} from "../schemas/goodsReceipt.schemas.js";

const router = express.Router();

// TODO cho TTS (#48): schema cho body { items, receiptType } và param :id, gắn validate(...)
// vào 2 route bên dưới (xem auth.routes.js làm mẫu), rồi xóa `if` validate trong service.
router.use(
  requireLogin,
  loadCurrentUser(userRepository),
  requireRoles(["admin"]),
);

router.post(
  "/",
  validate({ body: createGoodsReceiptBody }),
  goodsReceiptController.createWithItems,
);

router.post(
  "/:id/confirm",
  validate({ params: goodsReceiptIdParams }),
  goodsReceiptController.confirm,
);

export default router;
