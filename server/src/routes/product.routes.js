import express from "express";
const router = express.Router();
import { productController, userRepository } from "../container.js";
import requireLogin from "../middlewares/requireLogin.js";
import loadCurrentUser from "../middlewares/loadCurrentUser.js";
import requireRoles from "../middlewares/requireRoles.js";

router.use(requireLogin, loadCurrentUser(userRepository));

router.get("/", productController.getProducts);

router.post("/", requireRoles(["admin"]), productController.createProduct);

router.put("/:id", requireRoles(["admin"]), productController.updateProduct);

export default router;
