import { Request, Response } from "express";
import {
  createTransactionService,
  uploadPaymentService,
  acceptOrRejectTransactionService,
  cancelTransactionService,
  getActiveTransactionService,
  getAllTransactionsService,
  getTransactionByIdService,
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

  // Karena memoryStorage, file ada di req.file.buffer, bukan req.file.path
  const file = req.file;

  if (!file) {
    return res.status(400).send({ message: "Payment proof is required" });
  }

  const paymentProof = file.originalname;

  const result = await uploadPaymentService(
    transactionId,
    userId,
    paymentProof, // Sesuaikan dengan apa yang dibutuhkan service-mu
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

export const cancelTransactionController = async (
  req: Request,
  res: Response,
) => {
  const userId = res.locals.user.id;
  const transactionId = Number(req.params.id);
  const result = await cancelTransactionService(transactionId, userId);
  res
    .status(200)
    .send({ message: "Transaction cancelled successfully", data: result });
};

export const getActiveTransactionController = async (
  req: Request,
  res: Response,
) => {
  const userId = res.locals.user.id;
  const result = await getActiveTransactionService(userId);
  res.status(200).send({ data: result });
};

export const getAllTransactionsController = async (
  req: Request,
  res: Response,
) => {
  const userId = res.locals.user.id;
  const result = await getAllTransactionsService(userId);
  res.status(200).send({ data: result });
};

export const getTransactionByIdController = async (
  req: Request,
  res: Response,
) => {
  const transactionId = Number(req.params.id);
  const userId = res.locals.user.id;

  const result = await getTransactionByIdService(transactionId, userId);
  res.status(200).send({ data: result });
};
