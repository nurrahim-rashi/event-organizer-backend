import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import type { CreateTransactionSchema } from "../validators/transaction.validator.js";
import { TransactionStatus } from "../generated/prisma/enums.js";
import { sendMail } from "../lib/mail.js";

export const createTransactionService = async (
  body: CreateTransactionSchema,
  userId: number,
) => {
  const { eventId, items, voucherId, couponId, usePoints } = body;

  return await prisma.$transaction(async (tx) => {
    // --- Pengecekan Transaksi Aktif ---
    const activeTransaction = await tx.transaction.findFirst({
      where: {
        userId,
        status: {
          in: [TransactionStatus.WAITING_PAYMENT],
        },
        expiredAt: { gt: new Date() },
      },
    });

    if (activeTransaction) {
      throw new ApiError(
        "You have an ongoing transaction. Please finish payment or cancel it first.",
        400,
      );
    }

    let totalPrice = 0;
    const transactionItemsData = [];

    // 1. Validasi Stok & Hitung Harga Dasar
    for (const item of items) {
      const ticket = await tx.ticketType.findUnique({
        where: { id: item.ticketTypeId },
      });
      if (!ticket || ticket.totalTicket - ticket.booked < item.qty) {
        throw new ApiError(
          `Ticket ${ticket?.name || "unknown"} is out of stock`,
          400,
        );
      }
      totalPrice += ticket.price * item.qty;
      transactionItemsData.push({
        ticketTypeId: item.ticketTypeId,
        qty: item.qty,
        price: ticket.price,
      });
    }

    // 2. Validasi & Hitung Potongan Voucher/Coupon
    if (voucherId) {
      const voucher = await tx.voucher.findUnique({ where: { id: voucherId } });
      if (!voucher || voucher.quota <= 0 || new Date() > voucher.endDate) {
        throw new ApiError("Voucher invalid or expired", 400);
      }
      totalPrice = Math.max(0, totalPrice - voucher.discount);
      await tx.voucher.update({
        where: { id: voucherId },
        data: { quota: { decrement: 1 } },
      });
    }

    if (couponId) {
      const coupon = await tx.coupon.findUnique({ where: { id: couponId } });
      if (!coupon || new Date() > coupon.expiredAt) {
        throw new ApiError("Coupon invalid or expired", 400);
      }
      totalPrice = Math.max(0, totalPrice - coupon.discount);
      await tx.coupon.delete({ where: { id: couponId } }); // Coupon biasanya sekali pakai
    }

    // 3. Hitung Point
    let pointUsed = 0;
    if (usePoints) {
      const user = await tx.user.findUnique({ where: { id: userId } });
      pointUsed = Math.min(user?.points || 0, totalPrice);
      totalPrice -= pointUsed;
      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: pointUsed } },
      });
    }

    // 4. Buat Transaksi
    const transaction = await tx.transaction.create({
      data: {
        userId,
        eventId,
        voucherId,
        couponId,
        status: TransactionStatus.WAITING_PAYMENT,
        totalPrice,
        pointUsed,
        expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 Jam
        items: { create: transactionItemsData },
      },
      include: {
        items: { include: { ticketType: true } },
        voucher: true,
        coupon: true,
      },
    });

    // 5. Update Booked
    for (const item of items) {
      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { booked: { increment: item.qty } },
      });
    }

    return transaction;
  });
};

export const acceptOrRejectTransactionService = async (
  transactionId: number,
  status: "DONE" | "REJECTED",
) => {
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: { items: true },
    });

    if (!transaction) throw new ApiError("Transaction not found", 404);
    if (
      transaction.status !== TransactionStatus.WAITING_CONFIRMATION &&
      transaction.status !== TransactionStatus.WAITING_PAYMENT
    ) {
      throw new ApiError("Cannot change status of this transaction", 400);
    }

    await tx.transaction.update({
      where: { id: transactionId },
      data: { status: status as TransactionStatus },
    });

    if (status === "REJECTED") {
      if (transaction.pointUsed && transaction.pointUsed > 0) {
        await tx.user.update({
          where: { id: transaction.userId },
          data: { points: { increment: transaction.pointUsed } },
        });
      }
      for (const item of transaction.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { booked: { decrement: item.qty } },
        });
      }
    }
  });
};

export const uploadPaymentService = async (
  transactionId: number,
  userId: number,
  paymentProof: string,
) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) throw new ApiError("Transaction not found", 404);
  if (transaction.userId !== userId) throw new ApiError("Unauthorized", 403);
  if (new Date() > transaction.expiredAt)
    throw new ApiError("Transaction has expired", 400);
  if (transaction.status !== TransactionStatus.WAITING_PAYMENT)
    throw new ApiError("Invalid transaction status", 400);

  return await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      paymentProof,
      status: TransactionStatus.WAITING_CONFIRMATION,
    },
  });
};

export const cancelTransactionService = async (
  transactionId: number,
  userId: number,
) => {
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: { items: true },
    });

    if (!transaction || transaction.userId !== userId)
      throw new ApiError("Transaction not found", 404);

    // Hanya boleh dicancel jika masih WAITING_PAYMENT
    if (transaction.status !== TransactionStatus.WAITING_PAYMENT) {
      throw new ApiError("Cannot cancel this transaction", 400);
    }

    // 1. Update Status
    await tx.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.CANCELLED },
    });

    // 2. Balikin Stok Tiket
    for (const item of transaction.items) {
      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { booked: { decrement: item.qty } },
      });
    }

    if (transaction.pointUsed && transaction.pointUsed > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: transaction.pointUsed } },
      });
    }

    return { message: "Transaction cancelled" };
  });
};

export const getActiveTransactionService = async (userId: number) => {
  return await prisma.transaction.findFirst({
    where: {
      userId,
      status: {
        in: [TransactionStatus.WAITING_PAYMENT],
      },
      expiredAt: { gt: new Date() },
    },
    include: {
      event: true,
      items: { include: { ticketType: true } },
      voucher: true,
      coupon: true,
    },
  });
};

export const getAllTransactionsService = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new Error("User not found");

  // Jika Superadmin, ambil semua transaksi
  if (user.role === "SUPERADMIN") {
    return await prisma.transaction.findMany({
      include: { event: true, items: { include: { ticketType: true } } },
    });
  }

  // Jika Admin/Organizer, ambil transaksi dari event yang mereka buat
  if (user.role === "ADMIN") {
    return await prisma.transaction.findMany({
      where: {
        event: {
          organizerId: userId,
        },
      },
      include: { event: true, items: { include: { ticketType: true } } },
    });
  }

  // Jika user biasa, hanya ambil transaksi miliknya sendiri
  return await prisma.transaction.findMany({
    where: { userId: userId },
    include: { event: true, items: { include: { ticketType: true } } },
  });
};

export const getTransactionByIdService = async (
  transactionId: number,
  userId: number,
) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      event: true,
      items: { include: { ticketType: true } },
      voucher: true,
      coupon: true,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  const user = await prisma.user.findUnique({ where: { id: userId } });

  const isOwner = transaction.userId === userId;
  const isEventOrganizer = transaction.event.organizerId === userId;
  const isSuperAdmin = user?.role === "SUPERADMIN";

  if (isOwner || isEventOrganizer || isSuperAdmin) {
    return transaction;
  }

  throw new Error("Unauthorized: You do not have access to this transaction");
};

export const getIncomingTransactionService = async (eventId: number, userId: number) => {
  const eventCheck = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizerId: userId,
    },
  });

  if (!eventCheck) {
    throw new Error("Unauthorized or Event not found");
  }

  return await prisma.transaction.findMany({
    where: {
      eventId: eventId,
      status: "WAITING_CONFIRMATION",
    },

    select: {
      id: true,
      totalPrice: true,
      status: true,
      paymentProof: true,
      createdAt: true,
      event: {
        select: {
          name: true
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateTransactionStatusService = async (
  transactionId: number,
  status: "DONE" | "REJECTED",
) => {
  const processResult = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: {
        items: true,
        user: true,
        event: true,
      },
    });

    if (!transaction) {
      throw new ApiError("Transaction not found", 404);
    }

    if (
      transaction.status !== TransactionStatus.WAITING_CONFIRMATION &&
      transaction.status !== TransactionStatus.WAITING_PAYMENT
    ) {
      throw new ApiError("Cannot change status of this transaction", 400);
    }

    const updateData: {
      status: TransactionStatus;
      couponId?: null;
      voucherId?: null;
    } = {
      status: status as TransactionStatus,
    };

    if (status === "REJECTED") {
      if (transaction.couponId) updateData.couponId = null;
      if (transaction.voucherId) updateData.voucherId = null;
    }

    // Update Status Transaksi
    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: updateData,
    });

    // Logika Restore Aset jika REJECTED
    if (status === "REJECTED") {
      // A. Restore Poin User
      if (transaction.pointUsed && transaction.pointUsed > 0) {
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            points: { increment: transaction.pointUsed },
          },
        });
      }

      // B. Restore Seats / Quota Tiket
      for (const item of transaction.items) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            booked: { decrement: item.qty },
          },
        });
      }
    }

    return {
      ...updatedTransaction,
      user: transaction.user,
      event: transaction.event,
    };
  });

  // 2. Pengiriman Email Notifikasi (Di luar Prisma Transaction)
  try {
    const { user, event } = processResult;
    const isAccepted = status === "DONE";

    const subject = isAccepted ? `[CONFIRMED] Ticket Booking: ${event.name}` : `[REJECTED] Transaction Cancellation: ${event.name}`;

    await sendMail({
      to: user.email,
      subject,
      templateName: "transaction-status.hbs",
      context: {
        userName: user.name,
        eventName: event.name,
        isAccepted
      },
    });

    console.log(`[Email Notification] Successfully sent status '${status}' to ${user.email} for event '${event.name}'`);
  } catch (error) {
    // Pengiriman email gagal tidak membatalkan transaksi DB yang sudah berhasil
    console.error("Failed to send notification email:", error);
  }

  return {
    message: `Transaction #${processResult.id} status successfully updated to ${status}`,
    data: processResult,
  };
};

export const getTransactionsByEventService = async (eventId: number) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      eventId: eventId,
    },
  });

  return transactions;
};