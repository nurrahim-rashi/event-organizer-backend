import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { TransactionStatus } from "../generated/prisma/enums.js";

cron.schedule("* * * * *", async () => {
  const expiredTransactions = await prisma.transaction.updateMany({
    where: {
      status: TransactionStatus.WAITING_CONFIRMATION,
      expiredAt: { lt: new Date() },
    },
    data: { status: TransactionStatus.EXPIRED },
  });

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  await prisma.transaction.updateMany({
    where: {
      status: TransactionStatus.WAITING_CONFIRMATION,
      updatedAt: { lt: threeDaysAgo },
    },
    data: { status: TransactionStatus.CANCELLED },
  });
});
