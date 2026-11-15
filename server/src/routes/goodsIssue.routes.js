import express from "express";

import requireRoles from "../middlewares/requireRoles.js";
import requireLogin from "../middlewares/requireLogin.js";
import loadCurrentUser from "../middlewares/loadCurrentUser.js";

import { userRepository, goodsIssueController } from "../container.js";

const router = express.Router();

// TODO cho TTS (#48): schema cho body { items } và param :id, gắn validate(...) vào 2 route
// bên dưới (xem auth.routes.js làm mẫu), rồi xóa `if` validate trong service.

// Middleware áp dụng cho tất cả API xuất kho.
router.use(
  requireLogin,
  loadCurrentUser(userRepository),
  requireRoles(["admin"]),
);

// Tạo phiếu xuất kho.
router.post("/", goodsIssueController.createWithItems);

// Xác nhận phiếu xuất kho.
router.post("/:id/confirm", goodsIssueController.confirm);

export default router;
