import { Router } from "express";
import { getProfile } from "../controllers/organizer.controller.js";

export const organizerRoutes = Router();

organizerRoutes.get("/:id", getProfile);
