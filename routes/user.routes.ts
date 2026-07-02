import express from "express";
import {
  createUserController,
  getUserController,
  getUsersController,
  updateUserController,
  deleteUserController,
} from "../controllers/user.controller.js";
import { createUserValidator } from "../validators/user.validator.js";

export const userRoutes = express.Router();

userRoutes.get("/", getUsersController);
userRoutes.get("/:id", getUserController);
userRoutes.post("/", createUserValidator, createUserController);
userRoutes.patch("/:id", updateUserController);
userRoutes.delete("/:id", deleteUserController);