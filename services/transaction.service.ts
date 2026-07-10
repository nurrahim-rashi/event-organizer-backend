import { prisma } from "../lib/prisma.js";
import { TransactionItem } from "../generated/prisma/client.js";

type TransactionItemInput = Pick<TransactionItem, "ticketTypeId" | "qty">;

export const createTransactionService = async (
  userId: number,
  eventId: number,
  items: TransactionItemInput[],
  voucherId?: number,
) => {
  return await prisma.$transaction(async (tx) => {
    let totalPrice = 0;
    const transactionItemsData = [];

    // 1. Validasi & Hitung Harga Tiket
    for (const item of items) {
      const ticketType = await tx.ticketType.findUnique({
        where: { id: item.ticketTypeId },
      });
      if (!ticketType || ticketType.deletedAt)
        throw new Error("Ticket not found");

      if (ticketType.totalTicket - ticketType.booked < item.qty) {
        throw new Error(`Ticket '${ticketType.name}' is sold out`);
      }

      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { booked: { increment: item.qty } },
      });

      totalPrice += ticketType.price * item.qty;
      transactionItemsData.push({
        ticketTypeId: item.ticketTypeId,
        qty: item.qty,
        price: ticketType.price,
      });
    }

    // 2. Logika Voucher
    let appliedVoucherId = null;
    if (voucherId) {
      const voucher = await tx.voucher.findUnique({ where: { id: voucherId } });
      const now = new Date();

      if (
        voucher &&
        voucher.eventId === eventId &&
        voucher.quota > 0 &&
        now <= voucher.endDate
      ) {
        totalPrice = Math.max(0, totalPrice - voucher.discount);
        appliedVoucherId = voucher.id;

        // Kurangi kuota voucher
        await tx.voucher.update({
          where: { id: voucher.id },
          data: { quota: { decrement: 1 } },
        });
      }
    }

    // 3. Buat Transaksi
    const transaction = await tx.transaction.create({
      data: {
        userId,
        eventId,
        voucherId: appliedVoucherId,
        status: "WAITING_PAYMENT",
        totalPrice, // Ini sudah harga diskon
        expiredAt: new Date(Date.now() + 30 * 60 * 1000),
        items: { create: transactionItemsData },
      },
      include: { items: true },
    });

    return { data: transaction };
  });
};

export const getTransactionByIdService = async (
  transactionId: number,
  userId: number,
) => {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
    include: {
      items: {
        include: {
          ticketType: true, // Biar tahu nama tiket dan detailnya
        },
      },
      event: true, // Biar tahu info event-nya
      voucher: true, // Biar tahu voucher apa yang dipakai
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Keamanan: Pastikan user yang minta adalah pemilik transaksi
  if (transaction.userId !== userId) {
    throw new Error("Unauthorized access to this transaction");
  }

  return { data: transaction };
};
