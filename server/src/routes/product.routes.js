import express from "express";
const router = express.Router();
import { productController, userRepository } from "../container.js";
import requireLogin from "../middlewares/requireLogin.js";
import loadCurrentUser from "../middlewares/loadCurrentUser.js";
import requireRoles from "../middlewares/requireRoles.js";
import validate from "../middlewares/validate.js";
import {
  createProductBody,
  productIdParams,
  updateProductBody,
} from "../schemas/product.schemas.js";

router.use(requireLogin, loadCurrentUser(userRepository));

router.get("/", productController.getProducts);

router.post(
  "/",
  requireRoles(["admin"]),
  validate({ body: createProductBody }),
  productController.createProduct,
);

router.put(
  "/:id",
  requireRoles(["admin"]),
  validate({ params: productIdParams, body: updateProductBody }),
  productController.updateProduct,
);

export default router;
