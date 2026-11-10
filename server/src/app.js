require("dotenv").config();
const cookieParser = require("cookie-parser");

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const errorHandler = require("./middlewares/errorHandler");
const goodsReceiptRoutes = require("./routes/goodsReceipt.routes");
const goodsIssueRoutes = require("./routes/goodsIssue.routes");

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
const clientDist = path.join(__dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Mọi route không phải /api trả index.html để React Router xử lý (F5 không bị 404).
  app.get(/^\/(?!api(\/|$)).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(errorHandler);

module.exports = app;
