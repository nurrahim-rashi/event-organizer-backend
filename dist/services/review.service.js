import { prisma } from "../lib/prisma.js";
export const createReviewService = async (userId, transactionId, data) => {
    const transaction = await prisma.transaction.findFirst({
        where: { id: transactionId, userId },
    });
    if (!transaction || transaction.status !== "DONE") {
        throw new Error("You can only review completed transactions");
    }
    // 2. Cek apakah sudah pernah direview
    const existingReview = await prisma.review.findUnique({
        where: { transactionId },
    });
    if (existingReview)
        throw new Error("Review already exists for this transaction");
    // 3. Create Review
    return await prisma.review.create({
        data: { ...data, userId, transactionId },
    });
};
