import { Request, Response } from "express";
import {
  createTransactionService,
  uploadPaymentService,
  acceptOrRejectTransactionService,
} from "../services/transaction.service.js";

// 1. Controller untuk membuat transaksi
export const createTransactionController = async (
  req: Request,
  res: Response,
) => {
  const userId = res.locals.user.id;
  const result = await createTransactionService(req.body, userId);
  res.status(201).send({
    message: "Transaction created successfully",
    data: result,
  });
};

// 2. Controller untuk upload bukti pembayaran
export const uploadPaymentController = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const transactionId = Number(req.params.id);
  const paymentProof = req.file?.path; // Asumsi menggunakan multer untuk upload

  if (!paymentProof) {
    return res.status(400).send({ message: "Payment proof is required" });
  }

  const result = await uploadPaymentService(
    transactionId,
    userId,
    paymentProof,
  );
  res.status(200).send({
    message: "Payment proof uploaded, waiting for admin confirmation",
    data: result,
  });
};

// 3. Controller untuk Admin (Accept/Reject)
export const acceptOrRejectTransactionController = async (
  req: Request,
  res: Response,
) => {
  const transactionId = Number(req.params.id);
  const { status } = req.body; // "DONE" atau "REJECTED"

  const result = await acceptOrRejectTransactionService(transactionId, status);
  res.status(200).send({
    message: `Transaction has been ${status.toLowerCase()}`,
    data: result,
  });
};
