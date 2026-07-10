import { Router } from "express";
import {
  createTransactionController,
  getTransactionsByEventController,
} from "../controllers/transaction.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/checkout", createTransactionController);
router.get("/event/:eventId", getTransactionsByEventController);

export default router;
