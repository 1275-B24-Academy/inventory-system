import "dotenv/config";
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
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/goods-issues", goodsIssueRoutes);
app.use("/api/goods-receipts", goodsReceiptRoutes);

app.use(errorHandler);

export default app;
