import { Request, Response } from "express";
import { createReviewService } from "../services/review.service.js";
import { createReviewSchema } from "../validators/review.validator.js";

export const postReviewController = async (req: any, res: Response) => {
  console.log("DEBUG: Controller dipanggil"); // 1

  const validatedData = createReviewSchema.parse(req.body);
  console.log("DEBUG: Zod validasi lolos"); // 2

  const userId = req.user.id;
  console.log("DEBUG: User ID:", userId); // 3

  const review = await createReviewService(
    userId,
    validatedData.transactionId,
    { rating: validatedData.rating, comment: validatedData.comment },
  );
  console.log("DEBUG: Service selesai", review); // 4

  return res.status(201).json({
    message: "Review created successfully",
    data: review,
  });
};
