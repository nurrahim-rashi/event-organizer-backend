import { prisma } from "../lib/prisma.js";
import { TransactionItem, TransactionStatus } from "../generated/prisma/client.js";
import { number } from "zod";
import { ApiError } from "../utils/api-error.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

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

export const updateTransactionStatusService = async (
  req: AuthenticatedRequest,
  transactionId: number,
  newStatus: TransactionStatus,
) => {
  const organizerId = Number(req.user.id)

  //1. Cari transaksi berdasarkan event
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId},
    include: {
      event: {
        select: {
          organizerId: true,
        }
      }
    }
  });

  //2. Kalau ga ada throw ApiError 404
  if (!transaction) {
    throw new ApiError("Transaction does not exist", 404)
  }

  //3. Cek apakah transaksi sesuai dengan organizerId
  if (transaction.event.organizerId !== organizerId) {
    throw new ApiError("Forbidden access, you do not own this event", 403)
  }

  //4. Cek status masih "WAITING_CONFIRMATION" atau ngga
  if (transaction.status !== "WAITING_CONFIRMATION" && transaction.status !== "WAITING_PAYMENT") {
    throw new ApiError(`Cannot update status. Current status is ${transaction.status}`, 400)
  }

  //5. Update status transaski ke newStatus
  const updatedStatus = await prisma.transaction.update({
    where: {id: transactionId},
    data: {
      status: newStatus
    }
  });

  //6. return message (message + updated transaction)
  return {
    message: "Transaction updated successfully.",
    data: updatedStatus
  }
};

export const getIncomingTransactionsByEventService = async (
  eventId: number,
  organizerId: number
) => {
  if (isNaN(eventId)) throw new Error("Invalid event ID");
  // 1. Pastikan dulu kalau event ini benar-benar milik admin/organizer yang sedang login
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizerId: organizerId,
    },
  });

  if (!event) {
    throw new Error("Forbidden access or event not found");
  }

  // 2. Ambil daftar transaksi yang butuh konfirmasi
  const transactions = await prisma.transaction.findMany({
    where: {
      eventId: eventId,
      status: "WAITING_CONFIRMATION", // 🌟 Filter khusus status pending kamu
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Transaksi terbaru muncul di atas
    },
  });

  return { data: transactions };
};