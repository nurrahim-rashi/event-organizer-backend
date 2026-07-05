import { Router } from "express";
import * as pointController from "../controllers/point.controller.js";

const router = Router();

router.get("/user/:userId", pointController.getUserPoints);
router.post("/user/:userId/add", pointController.addPoints);

export default router;
