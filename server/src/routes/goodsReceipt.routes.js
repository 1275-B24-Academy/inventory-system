import express from "express";
import requireRoles from "../middlewares/requireRoles.js";
import requireLogin from "../middlewares/requireLogin.js";
import loadCurrentUser from "../middlewares/loadCurrentUser.js";
import { userRepository, goodsReceiptController } from "../container.js";

const router = express.Router();

router.use(
  requireLogin,
  loadCurrentUser(userRepository),
  requireRoles(["admin"]),
);

router.get("/", goodsReceiptController.getReceipts);
router.post("/", goodsReceiptController.createWithItems);
router.post("/:id/confirm", goodsReceiptController.confirm);

export default router;
