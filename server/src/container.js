const pool = require("./db");

const ProductRepository = require("./repositories/product.repository");
const ProductService = require("./services/product.service");
const ProductController = require("./controllers/product.controller");

const AuthService = require("./services/auth.service");
const UserRepository = require("./repositories/user.repository");
const AuthController = require("./controllers/auth.controller");

const GoodsReceiptService = require("./services/goodsReceipt.service");
const GoodsReceiptRepository = require("./repositories/goodsReceipt.repository");
const GoodsReceiptController = require("./controllers/goodsReceiptController");

const RefreshTokenRepository = require("./repositories/refreshToken.repository");

// 1. Tạo repository.
const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository(pool);
const goodsReceiptRepository = new GoodsReceiptRepository();

// 2. Đưa repository vào service.
const authService = new AuthService(
  userRepository,
  refreshTokenRepository
);
const goodsReceiptService = new GoodsReceiptService(goodsReceiptRepository);

// 3. Đưa service vào controller.
const authController = new AuthController(authService);
const goodsReceiptController = new GoodsReceiptController(goodsReceiptService);

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

module.exports = {
  productController,
  authController,
  userRepository,
  goodsReceiptController,
};