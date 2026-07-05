import { prisma } from "../lib/prisma.js";
import { TransactionItem } from "../generated/prisma/client.js";

type TransactionItemInput = Pick<TransactionItem, "ticketTypeId" | "qty">;

export const createTransactionService = async (
  userId: number,
  eventId: number,
  items: TransactionItemInput[],
) => {
  return await prisma.$transaction(async (tx) => {
    let totalPrice = 0;
    const transactionItemsData = [];

    for (const item of items) {
      const ticketType = await tx.ticketType.findUnique({
        where: { id: item.ticketTypeId },
      });

      if (!ticketType || ticketType.deletedAt) {
        throw new Error(`Ticket type ID ${item.ticketTypeId} not found`);
      }

      const remainingTickets = ticketType.totalTicket - ticketType.booked;
      if (remainingTickets < item.qty) {
        throw new Error(
          `Ticket '${ticketType.name}' is sold out or insufficient quota`,
        );
      }

      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: {
          booked: {
            increment: item.qty,
          },
        },
      });

      const itemPrice = ticketType.price * item.qty;
      totalPrice += itemPrice;

      transactionItemsData.push({
        ticketTypeId: item.ticketTypeId,
        qty: item.qty,
        price: ticketType.price,
      });
    }

    const transaction = await tx.transaction.create({
      data: {
        userId,
        eventId,
        status: "WAITING_PAYMENT",
        totalPrice,
        expiredAt: new Date(Date.now() + 30 * 60 * 1000),
        items: {
          create: transactionItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return { data: transaction };
  });
};

export const getTransactionsByEventService = async (
  userId: number,
  eventId: number,
) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userId,
      eventId: eventId,
    },
    include: {
      items: {
        include: {
          ticketType: true,
        },
      },
    },
  });

  return { data: transactions };
};
