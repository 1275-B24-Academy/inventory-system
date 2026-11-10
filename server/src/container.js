import pool from "./db.js";
import prisma from "./prisma.js";

import ProductRepository from "./repositories/product.repository.js";
import ProductService from "./services/product.service.js";
import ProductController from "./controllers/product.controller.js";

import AuthService from "./services/auth.service.js";
import UserRepository from "./repositories/user.repository.js";
import AuthController from "./controllers/auth.controller.js";

import GoodsReceiptService from "./services/goodsReceipt.service.js";
import GoodsReceiptRepository from "./repositories/goodsReceipt.repository.js";
import GoodsReceiptController from "./controllers/goodsReceiptController.js";

import GoodsIssueService from "./services/goodsIssue.service.js";
import GoodsIssueRepository from "./repositories/goodsIssue.repository.js";
import GoodsIssueController from "./controllers/goodsIssueController.js";

import RefreshTokenRepository from "./repositories/refreshToken.repository.js";

// 1. Tạo repository.
const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository(pool);
const goodsReceiptRepository = new GoodsReceiptRepository();
const goodsIssueRepository = new GoodsIssueRepository();

// 2. Đưa repository vào service.
const authService = new AuthService(userRepository, refreshTokenRepository);
const goodsReceiptService = new GoodsReceiptService(goodsReceiptRepository);
const goodsIssueService = new GoodsIssueService(goodsIssueRepository);

// 3. Đưa service vào controller.
const authController = new AuthController(authService);
const goodsReceiptController = new GoodsReceiptController(goodsReceiptService);
const goodsIssueController = new GoodsIssueController(goodsIssueService);

const productRepository = new ProductRepository(prisma);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

export {
  productController,
  authController,
  userRepository,
  goodsReceiptController,
  goodsIssueController,
};
