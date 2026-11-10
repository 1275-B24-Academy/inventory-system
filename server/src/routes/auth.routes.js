const express = require("express");
const router = express.Router();
const { authController } = require("../container");
const { loginLimiter, registerLimiter } = require("../middlewares/rateLimit");

router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

module.exports = router;
