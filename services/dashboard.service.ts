import { prisma } from "../lib/prisma.js";


export const getDashboardStatsService = async (userId: number, role: string) => {
  if (role === "ADMIN") {
    // 1. Hitung total event aktif milik EO ini (yang belum dihapus)
    const activeEventsCount = await prisma.event.count({
      where: {
        organizerId: userId, // sesuaikan dengan nama field relasi user di skema event kalian
        deletedAt: null,
      },
    });

    // 2. Hitung total tiket terjual dari event milik EO ini
    const ticketsSoldAggregation = await prisma.ticketType.aggregate({
      where: {
        event: {
          organizerId: userId,
        },
        deletedAt: null,
      },
      _sum: {
        booked: true,
      }
    });

    // 3. Hitung total pendapatan dari event milik EO ini (asumsi ada field price di Ticket)
    const allTicketTypes = await prisma.ticketType.findMany({
      where: {
        event: {
          organizerId: userId,
        },
      },
      select: {
        booked: true,
        price: true,
      }
    });

    const totalEarnings = allTicketTypes.reduce((sum, ticket) => {
        return sum + (ticket.booked * ticket.price);
    }, 0);

    return {
      activeEventsCount,
      ticketsSold: ticketsSoldAggregation._sum.booked || 0,
      totalEarnings: totalEarnings,
    };
  } else {
    // 🌟 JIKA CUSTOMER BIASA: Hitung tiket yang dia miliki
    const totalTicketsOwned = await prisma.transaction.count({
      where: {
        userId: userId,
      },
    });

    return {
      totalTicketsOwned,
    };
  }
};