import { Request, RequestHandler, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createTransactionService,
  getTransactionByIdService,
  updateTransactionStatusService,
  getIncomingTransactionsByEventService
} from "../services/transaction.service.js";
import { ApiError } from "../utils/api-error.js";
import { TransactionStatus } from "../generated/prisma/enums.js";
import { success } from "zod";

export const getTransactionsByEventController = async (
  req: Request,
  res: Response,
) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw new ApiError("Unauthorized", 401);
  }

  const eventId = Number(req.params.eventId);
  const result = await getTransactionByIdService(userId, eventId);

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const createTransactionController = async (
  req: Request,
  res: Response,
) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw new ApiError("Unauthorized", 401);
  }

  const { eventId, items } = req.body;
  const result = await createTransactionService(userId, Number(eventId), items);

  res.status(201).json({
    success: true,
    ...result,
  });
};

export const updateTransactionStatusController = async (
  req: Request,
  res: Response,
) => {
  const userId = (req as AuthenticatedRequest).user?.id;
  if (!userId) {
    throw new ApiError("Unauthorized", 401);
  }

  const transactionId = Number(req.params.transactionId);
  if (isNaN(transactionId)) {
    throw new ApiError("Invalid transaction ID", 400)
  }

  const {newStatus} = req.body as {newStatus: TransactionStatus};
  if (!newStatus) {
    throw new ApiError("Status is required", 400)
  }

  const result = await updateTransactionStatusService(
    req as AuthenticatedRequest,
    transactionId,
    newStatus,
  );

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getIncomingTransactionsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const eventId = Number(req.params.eventId);
  const organizerId = Number(req.user.id);

  // Jika service melempar error, Express 5 akan otomatis menangkapnya
  const result = await getIncomingTransactionsByEventService(eventId, organizerId);
  
  res.status(200).send({
    success: true,
    data: result.data
  });
};