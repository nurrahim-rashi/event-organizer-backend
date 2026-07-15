import express from "express";
import { forgotPasswordController, loginController, registerController, resetPasswordController } from "../controllers/auth.controller.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validation.middleware.js";

const authRoutes = express.Router();

authRoutes.post("/register", validate(registerSchema), registerController);
authRoutes.post("/login", validate(loginSchema), loginController);
authRoutes.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordController);
authRoutes.post("/reset-password", validate(resetPasswordSchema), resetPasswordController);

export {authRoutes};