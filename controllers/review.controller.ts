import { Request, Response } from "express";
import { createReviewService } from "../services/review.service.js";
import { createReviewSchema } from "../validators/review.validator.js";

export const postReviewController = async (req: any, res: Response) => {
  const validatedData = createReviewSchema.parse(req.body);
  const userId = req.user.id;
  const review = await createReviewService(
    userId,
    validatedData.transactionId,
    { rating: validatedData.rating, comment: validatedData.comment },
  );
  return res.status(201).json({
    message: "Review created successfully",
    data: review,
  });
};
