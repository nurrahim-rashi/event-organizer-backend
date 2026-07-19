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

    const managedEventsRaw = await prisma.event.findMany({
      where: {
        organizerId: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        _count: {
          select: {
            transactions: {
              where: {
                status: "DONE"
              }
            }
          }
        }
      },
      orderBy: {
        startDate: "desc",
      },
    });

    const managedEvents = managedEventsRaw.map((event) => ({
      id: event.id,
      name: event.name,
      startDate: event.startDate,
      ticketsSold: event._count.transactions,
    }));

    const stats = await prisma.transaction.aggregate({
      where: {
        event: {
          organizerId: userId,
          deletedAt: null,
        },
        status: "DONE",
      },
      _sum: {
        totalPrice: true,
      },
      _count: {
        id: true,
      }
    });

    return {
      activeEventsCount,
      ticketsSold: stats._count.id || 0,
      totalEarnings: stats._sum.totalPrice || 0,
      managedEvents,
    };
  } else {
    // 🌟 JIKA CUSTOMER BIASA: Hitung tiket yang dia miliki
    const totalTicketsOwned = await prisma.transaction.count({
      where: {
        userId: userId,
        status: "DONE",
      },
    });

    return {
      totalTicketsOwned,
    };
  }
};