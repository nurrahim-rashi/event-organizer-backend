import express from "express";
import {
  createTransactionController,
  uploadPaymentController,
  acceptOrRejectTransactionController,
  cancelTransactionController,
  getActiveTransactionController,
} from "../controllers/transaction.controller.js";
import { verifyRole, verifyToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createTransactionSchema } from "../validators/transaction.validator.js";

const transactionRoutes = express.Router();

// 1. User: Membuat transaksi tiket
transactionRoutes.post(
  "/checkout",
  verifyToken(process.env.JWT_SECRET!),
  verifyRole(["USER", "ADMIN", "SUPERADMIN"]),
  validate(createTransactionSchema),
  createTransactionController,
);

// 2. User: Mengunggah bukti pembayaran (Upload)
transactionRoutes.patch(
  "/:id/upload",
  verifyToken(process.env.JWT_SECRET!),
  verifyRole(["USER", "ADMIN"]),
  uploadPaymentController,
);

// 3. Admin/Organizer: Menyetujui atau menolak transaksi
transactionRoutes.patch(
  "/:id/status",
  verifyToken(process.env.JWT_SECRET!),
  verifyRole(["ADMIN", "SUPERADMIN"]),
  acceptOrRejectTransactionController,
);

// Tambahkan di routes/transaction.routes.ts
transactionRoutes.patch(
  "/:id/cancel",
  verifyToken(process.env.JWT_SECRET!),
  verifyRole(["USER", "SUPERADMIN"]),
  cancelTransactionController,
);

transactionRoutes.get(
  "/active",
  verifyToken(process.env.JWT_SECRET!),
  getActiveTransactionController,
);

export { transactionRoutes };
