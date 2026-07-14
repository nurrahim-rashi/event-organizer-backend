import { Router } from "express";
import {
  createTransactionController,
  getIncomingTransactionsController,
  getTransactionsByEventController,
  updateTransactionStatusController,
} from "../controllers/transaction.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { RequestHandler } from "express";

const router = Router();

router.use(verifyToken);

router.post("/checkout", createTransactionController);
router.get("/event/:eventId.all", getTransactionsByEventController);
router.patch("/:transactionId/status", verifyToken, updateTransactionStatusController);
router.get("/event/:eventId/incoming", verifyToken, getIncomingTransactionsController as unknown as RequestHandler);

export default router;
