import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
export const reminderCron = () => {
    cron.schedule("*/30 * * * *", async () => {
        const ninetyMinutesAgo = new Date(Date.now() - 90 * 60 * 1000);
        const pendingTransactions = await prisma.transaction.findMany({
            where: {
                status: "WAITING_PAYMENT",
                createdAt: { lte: ninetyMinutesAgo },
            },
            include: { user: true },
        });
        for (const tx of pendingTransactions) {
            // Logic kirim email/notifikasi ke tx.user.email
            console.log(`Send reminder to ${tx.user.email} for transaction ${tx.id}`);
        }
    });
};
