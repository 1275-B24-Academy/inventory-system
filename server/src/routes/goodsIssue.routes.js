const express = require("express");

const requireRoles = require("../middlewares/requireRoles");
const requireLogin = require("../middlewares/requireLogin");
const loadCurrentUser = require("../middlewares/loadCurrentUser");

const { userRepository, goodsIssueController } = require("../container");

const router = express.Router();

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

module.exports = router;
