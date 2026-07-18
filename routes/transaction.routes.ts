import express from "express";
import {
  createTransactionController,
  uploadPaymentController,
  acceptOrRejectTransactionController,
} from "../controllers/transaction.controller.js";
import { verifyRole, verifyToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createTransactionSchema } from "../validators/transaction.validator.js";

const transactionRoutes = express.Router();

// 1. User: Membuat transaksi tiket
// di routes/transaction.routes.ts
transactionRoutes.post(
  "/checkout",
  verifyToken(process.env.JWT_SECRET!),
  verifyRole(["USER", "ADMIN", "SUPERADMIN"]),
  validate(createTransactionSchema),
  createTransactionController,
);

// 2. User: Mengunggah bukti pembayaran (Upload)
// Catatan: Pastikan Anda memiliki middleware untuk menangani upload file (seperti multer)
transactionRoutes.patch(
  "/:id/upload",
  verifyToken(process.env.JWT_SECRET!),
  verifyRole(["USER"]),
  uploadPaymentController,
);

// 3. Admin/Organizer: Menyetujui atau menolak transaksi
transactionRoutes.patch(
  "/:id/status",
  verifyToken(process.env.JWT_SECRET!),
  verifyRole(["ADMIN", "SUPERADMIN"]), // Sesuaikan dengan peran yang berhak memproses
  acceptOrRejectTransactionController,
);

export { transactionRoutes };
