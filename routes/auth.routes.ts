import express from "express";
import { loginController, registerController } from "../controllers/auth.controller.js";

const authRoutes = express.Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);

export {authRoutes};