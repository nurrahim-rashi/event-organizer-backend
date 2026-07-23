import { prisma } from "../lib/prisma.js";

export const getDashboardStatsService = async (
  userId: number, 
  role: string,
  filter: "day" | "month" | "year" = "month",
  eventId?: number,
) => {
  if (role === "ADMIN") {
    // 1. Hitung total event aktif milik EO ini (yang belum dihapus)
    const activeEventsCount = await prisma.event.count({
      where: {
        organizerId: userId,
        deletedAt: null,
      },
    });

    // 2. Ambil semua event yang dikelola beserta detail transaksi untuk hitung tiket riil
    const managedEventsRaw = await prisma.event.findMany({
      where: {
        organizerId: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        transactions: {
          where: { status: "DONE" },
          select: {
            items: {
              select: { qty: true }
            }
          }
        }
      },
      orderBy: {
        startDate: "desc",
      },
    });

    // ------------- DEBUG ---------------------
    console.log("\n======  DEBUG BACKEND SERVICE  ======");
    console.log("ID User yang Login   :", userId);
    console.log("Role User            :", role);
    console.log("Active Events Count  :", activeEventsCount);
    console.log("Managed Events Found :", managedEventsRaw.length);
    console.log("=========================================\n");


    // Hitung total tiket terjual per event secara akurat dari relasi items
    const managedEvents = managedEventsRaw.map((event) => {
      const totalTicketsForEvent = event.transactions.reduce((sumTx, tx) => {
        const txQty = tx.items && tx.items.length > 0
          ? tx.items.reduce((sumItem, item) => sumItem + item.qty, 0)
          : 1; // Fallback jika detail item kosong di database
        return sumTx + txQty;
      }, 0);

      return {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        ticketsSold: totalTicketsForEvent, // Sekarang isinya jumlah tiket riil, bukan jumlah invoice
      };
    });

    // 3. Ambil data transaksi untuk kebutuhan grafik (Agregasi 'stats' dihapus karena mubazir)
    const chartTransactions = await prisma.transaction.findMany({
      where: {
        status: "DONE",
        eventId: eventId ? Number(eventId) : undefined,
        event: {
          organizerId: userId,
          deletedAt: null,
        },
      },
      select: {
        totalPrice: true,
        createdAt: true,
        items: {
          select: {
            qty: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    const statsMap = new Map<string, {label: string; revenue: number; ticketsSold: number}>();

    let totalEarningsAccumulator = 0;
    let totalTicketsSoldAccumulator = 0;

    chartTransactions.forEach((tx) => {
      const date = new Date(tx.createdAt);
      let label = "";

      if (filter === "day") {
        label = date.toLocaleDateString("id-ID", {day: "numeric", month: "short"});
      } else if (filter === "year") {
        label = date.getFullYear().toString();
      } else {
        label = date.toLocaleDateString("id-ID", {month: "short"});
      }

      if (!statsMap.has(label)) {
        statsMap.set(label, { label, revenue: 0, ticketsSold: 0 });
      }

      const totalTicketsInTransaction = tx.items && tx.items.length > 0
        ? tx.items.reduce((sum, item) => sum + item.qty, 0)
        : 1;

      const currentData = statsMap.get(label)!;
      currentData.revenue += tx.totalPrice;
      currentData.ticketsSold += totalTicketsInTransaction;

      totalEarningsAccumulator += tx.totalPrice;
      totalTicketsSoldAccumulator += totalTicketsInTransaction;
    });

    const statistics = Array.from(statsMap.values());

    return {
      activeEventsCount,
      ticketsSold: totalTicketsSoldAccumulator,
      totalEarnings: totalEarningsAccumulator,
      managedEvents,
      statistics,
    };
  } else {
    // 🌟 JIKA CUSTOMER BIASA
    const now = new Date();

    const totalTicketsOwned = await prisma.transaction.count({
      where: {
        userId: userId,
        status: "DONE",
      },
    });

    const activeEventsCount = await prisma.event.count({
      where: {
        deletedAt: null,
        startDate: {gte: now},
      },
    });

    const recommendedEvents = await prisma.event.findMany({
      where: {
        deletedAt: null,
        startDate: {gte: now},
        transactions: {
          none: {
            userId: userId,
            status: "DONE",
          },
        },
      },
      take: 6,
      orderBy: {
        startDate: "asc",
      },
    });
    
    const upcomingTransactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        status:"DONE",
        event: {
          deletedAt: null,
          startDate: {gte: now},
        },
      },
      include: {
        event: true,
      },
      orderBy: {
        event: {
          startDate: "asc",
        },
      },
    });

    const upcomingEventsMap = new Map();
    upcomingTransactions.forEach((tx) => {
      if (tx.event && !upcomingEventsMap.has(tx.event.id)) {
        upcomingEventsMap.set(tx.event.id, tx.event);
      };
    });
    const upcomingEvents = Array.from(upcomingEventsMap.values());

    return {
      totalTicketsOwned,
      activeEventsCount,
      recommendedEvents,
      upcomingEvents,
    };
  }
};