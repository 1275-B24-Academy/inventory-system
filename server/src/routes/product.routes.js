const express = require("express");
const router = express.Router();
const { productController, userRepository } = require("../container");

const requireLogin = require("../middlewares/requireLogin");
const loadCurrentUser = require("../middlewares/loadCurrentUser");
const requireRoles = require("../middlewares/requireRoles");

router.use(requireLogin, loadCurrentUser(userRepository));

router.get("/", productController.getProducts);

router.post("/", requireRoles(["admin"]), productController.createProduct);

router.put("/:id", requireRoles(["admin"]), productController.updateProduct);

module.exports = router;
