import express from "express";
import { authController } from "../container.js";
import validate from "../middlewares/validate.js";
import { loginBody, registerBody } from "../schemas/auth.schemas.js";

const router = express.Router();

router.post(
  "/register",
  validate({ body: registerBody }),
  authController.register,
);
router.post("/login", validate({ body: loginBody }), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;
