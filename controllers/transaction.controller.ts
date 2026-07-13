import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createTransactionService,
  getTransactionByIdService,
} from "../services/transaction.service.js";
import { ApiError } from "../utils/api-error.js";

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
