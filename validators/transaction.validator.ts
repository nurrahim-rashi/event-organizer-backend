import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/api-error.js";

export const createTransactionSchema = z.object({
  eventId: z
    .number()
    .min(1, "Event ID is required")
    .int("Event ID must be an integer"),

  items: z
    .array(
      z.object({
        ticketTypeId: z.number().min(1, "Ticket Type ID is required"),
        qty: z
          .number()
          .min(1, "Quantity must be at least 1")
          .int("Quantity must be an integer"),
      }),
    )
    .min(1, "At least one ticket must be selected"),

  voucherId: z.number().int().optional(),
  couponId: z.number().int().optional(),
  usePoints: z.boolean().optional(),
});

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;

export const validateCreateTransaction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = createTransactionSchema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(", ");
    return next(new ApiError(message, 400));
  }

  next();
};
