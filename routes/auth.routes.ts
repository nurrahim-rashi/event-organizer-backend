import express from "express";
import { loginController } from "../controllers/auth.controller.js";

const authRoutes = express.Router();

authRoutes.post("/login", loginController);

export {authRoutes};