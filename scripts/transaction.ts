import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

export const transactionCron = () => {
  // Run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // 1. Handle EXPIRED: WAITING_PAYMENT > 2 hours
    const expiredTransactions = await prisma.transaction.findMany({
      where: {
        status: "WAITING_PAYMENT",
        createdAt: { lte: twoHoursAgo },
      },
      include: { items: true },
    });

    for (const tx of expiredTransactions) {
      await restoreAndCancel(tx, "EXPIRED");
    }

    // 2. Handle CANCELLED: WAITING_CONFIRMATION > 3 days
    const cancelledTransactions = await prisma.transaction.findMany({
      where: {
        status: "WAITING_CONFIRMATION",
        updatedAt: { lte: threeDaysAgo },
      },
      include: { items: true },
    });

    for (const tx of cancelledTransactions) {
      await restoreAndCancel(tx, "CANCELLED");
    }
  });
};

/**
 * Helper to process status changes and rollbacks
 */
async function restoreAndCancel(
  tx: any,
  targetStatus: "EXPIRED" | "CANCELLED",
) {
  await prisma.$transaction(async (prismaTx) => {
    // Update transaction status
    await prismaTx.transaction.update({
      where: { id: tx.id },
      data: { status: targetStatus },
    });

    // Restore ticket quantity
    for (const item of tx.items) {
      await prismaTx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { booked: { decrement: item.qty } },
      });
    }

    // Restore points if they were used
    if (tx.pointUsed && tx.pointUsed > 0) {
      await prismaTx.user.update({
        where: { id: tx.userId },
        data: { points: { increment: tx.pointUsed } },
      });
    }

    // Note: If you implement voucher/coupon logic to return
    // to user, add that update logic here.
  });
}
