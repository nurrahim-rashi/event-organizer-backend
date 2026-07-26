import express from "express";
import { createTransactionController, uploadPaymentController, acceptOrRejectTransactionController, cancelTransactionController, getActiveTransactionController, getAllTransactionsController, getTransactionByIdController, getIncomingTransactionController, updateTransactionStatusController, getTransactionsByEventController, } from "../controllers/transaction.controller.js";
import { verifyRole, verifyToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createTransactionSchema } from "../validators/transaction.validator.js";
import { upload } from "../middlewares/multer.js";
const transactionRoutes = express.Router();
// 1. User: Membuat transaksi tiket
transactionRoutes.post("/checkout", verifyToken(process.env.JWT_SECRET), verifyRole(["USER"]), validate(createTransactionSchema), createTransactionController);
// 2. User: Mengunggah bukti pembayaran (Upload)
transactionRoutes.patch("/:id/upload", verifyToken(process.env.JWT_SECRET), verifyRole(["USER"]), upload.single("paymentProof"), uploadPaymentController);
// 3. Admin/Organizer: Menyetujui atau menolak transaksi
transactionRoutes.patch("/:id/status", verifyToken(process.env.JWT_SECRET), verifyRole(["ADMIN", "SUPERADMIN"]), acceptOrRejectTransactionController);
// Tambahkan di routes/transaction.routes.ts
transactionRoutes.patch("/:id/cancel", verifyToken(process.env.JWT_SECRET), verifyRole(["USER", "ADMIN", "SUPERADMIN"]), cancelTransactionController);
transactionRoutes.patch("/:id/update", verifyToken(process.env.JWT_SECRET), verifyRole(["ADMIN", "SUPERADMIN"]), updateTransactionStatusController);
transactionRoutes.get("/checkout", verifyToken(process.env.JWT_SECRET), verifyRole(["USER"]), getActiveTransactionController);
transactionRoutes.get("/", verifyToken(process.env.JWT_SECRET), verifyRole(["USER", "ADMIN", "SUPERADMIN"]), getAllTransactionsController);
transactionRoutes.get("/:id", verifyToken(process.env.JWT_SECRET), verifyRole(["USER", "ADMIN", "SUPERADMIN"]), getTransactionByIdController);
transactionRoutes.get("/event/:eventId/incoming", verifyToken(process.env.JWT_SECRET), verifyRole(["ADMIN", "SUPERADMIN"]), // Hanya boleh diakses Admin/EO
getIncomingTransactionController);
transactionRoutes.get("/event/:eventId", verifyToken(process.env.JWT_SECRET), getTransactionsByEventController);
export { transactionRoutes };
