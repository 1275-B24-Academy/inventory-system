import express from "express";

import requireRoles from "../middlewares/requireRoles.js";
import requireLogin from "../middlewares/requireLogin.js";
import loadCurrentUser from "../middlewares/loadCurrentUser.js";

import { userRepository, goodsIssueController } from "../container.js";

const router = express.Router();

// Middleware áp dụng cho tất cả API xuất kho.
router.use(
  requireLogin,
  loadCurrentUser(userRepository),
  requireRoles(["admin"]),
);

// Danh sách phiếu xuất kho.
router.get("/", goodsIssueController.getIssues);

// Tạo phiếu xuất kho.
router.post("/", goodsIssueController.createWithItems);

// Xác nhận phiếu xuất kho.
router.post("/:id/confirm", goodsIssueController.confirm);

export default router;
