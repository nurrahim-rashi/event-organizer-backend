import { Request, Response } from "express";
import {
  createTransactionService,
  uploadPaymentService,
  acceptOrRejectTransactionService,
  cancelTransactionService,
  getActiveTransactionService,
  getAllTransactionsService,
  getTransactionByIdService,
  getIncomingTransactionService,
  updateTransactionStatusService,
  getTransactionsByEventService,
} from "../services/transaction.service.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { success } from "zod";
import { ApiError } from "../utils/api-error.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";

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

  const paymentProof = await cloudinaryUpload(file, "payment_proofs");

  const result = await uploadPaymentService(
    transactionId,
    userId,
    paymentProof.secure_url,
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

  if (isNaN(transactionId) || transactionId <= 0) {
    return res.status(400).json({
      message: "Invalid transaction ID"
    });
  }

  const userId = res.locals.user.id;
  const result = await getTransactionByIdService(transactionId, userId);
  
  if (!result){
    return res.status(404).json({
      message: "Transaction not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: result,
  });
};

export const getIncomingTransactionController = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  
  const eventId = Number(authReq.params.eventId);
  const userId = Number(authReq.user.id);

  const incomingTransactions = await getIncomingTransactionService(eventId, userId);

  res.status(200).send({success: true, data: incomingTransactions,});
};

export const updateTransactionStatusController = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const { status } = req.body;

  const transactionId = Number(id);
  if (isNaN(transactionId)) {
    throw new ApiError ("Invalid Transaction ID", 400);
  }

  if (!status || !["DONE", "REJECTED"].includes(status)) {
    throw new ApiError("Status must be either 'DONE' or 'REJECTED'", 400);
  }

  const result = await updateTransactionStatusService(transactionId, status);

  return res.status(200).json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

export const getTransactionsByEventController = async (
  req: Request,
  res: Response
) => {
  const { eventId } = req.params;

  const data = await getTransactionsByEventService(Number(eventId));

  return res.status(200).send({
    message: "Get transactions by event successfully",
    data,
  });
};