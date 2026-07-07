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

    const managedEvents = await prisma.event.findMany({
      where: {
        organizerId: userId,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
      },
      orderBy: {
        startDate: 'asc'
      },
    });

    return {
      activeEventsCount,
      ticketsSold: ticketsSoldAggregation._sum.booked || 0,
      totalEarnings: totalEarnings,
      managedEvents: managedEvents,
    };



  } else {
    // 🌟 JIKA CUSTOMER BIASA: Hitung tiket yang dia miliki
    const totalTicketsOwned = await prisma.transaction.count({
      where: {
        userId: userId,
      },
    });

    const upcomingTickets = await prisma.transaction.findMany({
      where: {
        userId: userId,
        status: {
          in: ["PAID", "DONE"]
        },
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            location: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const wishlistEvents = await prisma.event.findMany({
      take: 2,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        location: true,
      }
    });

    const totalAvailableEvents = await prisma.event.count();

    return {
      totalTicketsOwned,
      upcomingTickets,
      wishlistEvents,
      totalAvailableEvents,
    };
  }
};