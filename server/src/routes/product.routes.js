const express = require("express");
const router = express.Router();
const {productController} = require("../container");



router.get("/", productController.getProducts); 

router.post("/", productController.createProduct);

router.put("/:id", productController.updateProduct);

module.exports = router;