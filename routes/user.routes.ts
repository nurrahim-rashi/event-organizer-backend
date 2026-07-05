import express from "express";
import {
  createUserController,
  getUserController,
  getUsersController,
  updateUserController,
  deleteUserController,
} from "../controllers/user.controller.js";
import { createUserValidator } from "../validators/user.validator.js";
import { upload } from "../middlewares/multer.js";

export const userRoutes = express.Router();

userRoutes.get("/", getUsersController);
userRoutes.get("/:id", getUserController);
userRoutes.post("/", createUserValidator, createUserController);
userRoutes.patch("/:id", upload.single("profilePic") ,updateUserController);
userRoutes.delete("/:id", deleteUserController);