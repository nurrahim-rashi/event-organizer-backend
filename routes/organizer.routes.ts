import { Router } from "express";
import { getProfile } from "../controllers/organizer.controller.js";

const router = Router();

router.get("/:id", getProfile);

export default router;
