import z from "zod";
export const createReviewSchema = z.object({
    transactionId: z.number({
        message: "Transaction ID is required",
    }),
    rating: z
        .number({
        message: "Rating is required",
    })
        .min(1, "Rating at least 1")
        .max(5, "Rating max 5"),
    comment: z
        .string({
        message: "Comment is required",
    })
        .min(1, "Comment cannot be empty")
        .max(500, "Comment too long"),
});
