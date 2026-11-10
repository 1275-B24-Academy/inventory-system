const express = require("express");
const requireRoles = require("../middlewares/requireRoles");
const requireLogin = require("../middlewares/requireLogin");
const loadCurrentUser = require("../middlewares/loadCurrentUser");
const { userRepository, goodsReceiptController } = require("../container");
const router = express.Router();

router.use(
  requireLogin,
  loadCurrentUser(userRepository),
  requireRoles(["admin"]),
);

router.post("/", goodsReceiptController.createWithItems);
router.post("/:id/confirm", goodsReceiptController.confirm);
router.get("/", goodsReceiptController.getReceipts);

module.exports = router;
