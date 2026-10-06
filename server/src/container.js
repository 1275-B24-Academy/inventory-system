const ProductRepository = require("./repositories/product.repository");
const ProductService = require("./services/product.service");
const ProductController = require("./controllers/product.controller");

const AuthService = require("./services/auth.service");
const UserRepository = require("./repositories/user.repository");
const AuthController = require("./controllers/Auth.controller");

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

module.exports =  {
    productController,
    authController
} ;