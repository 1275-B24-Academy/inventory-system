import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import errorHandler from "./middlewares/errorHandler.js";
import goodsReceiptRoutes from "./routes/goodsReceipt.routes.js";
import goodsIssueRoutes from "./routes/goodsIssue.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Liveness: chỉ báo process còn sống, KHÔNG query DB (để Neon được scale-to-zero).
// Đặt trước /api và trước route serve client, nếu không sẽ bị trả index.html.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/goods-issues", goodsIssueRoutes);
app.use("/api/goods-receipts", goodsReceiptRoutes);

// Production: server serve luôn bản build của client -> chung domain, cookie refresh là first-party.
const clientDist = path.join(import.meta.dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Mọi route không phải /api trả index.html để React Router xử lý (F5 không bị 404).
  app.get(/^\/(?!api(\/|$)).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(errorHandler);

export default app;
