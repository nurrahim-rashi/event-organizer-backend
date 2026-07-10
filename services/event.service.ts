import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

type CreateEventBody = {
  name: string;
  description: string;
  location: string;
  category: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  organizerId: number;
  ticketTypes?: Array<{ name: string; price: number; totalTicket: number }>;
  vouchers?: Array<{
    code: string;
    discount: number;
    quota: number;
    startDate: string;
    endDate: string;
  }>;
};

// Update interface agar menerima ticketTypes dan vouchers
type UpdateEventBody = {
  name?: string;
  description?: string;
  location?: string;
  category?: string;
  bannerImage?: string;
  startDate?: string;
  endDate?: string;
  ticketTypes?: Array<{
    id?: number;
    name: string;
    price: number;
    totalTicket: number;
  }>;
  vouchers?: Array<{
    id?: number;
    code: string;
    discount: number;
    quota: number;
    startDate: string;
    endDate: string;
  }>;
};

type DeleteEventResponse = {
  message: string;
};

type GetEventsQueryParams = {
  search?: string;
  category?: string;
  location?: string;
  sort?: string;
  page?: string;
  limit?: string;
};

export const getEventsService = async (query: GetEventsQueryParams) => {
  const { search, category, location, sort, page, limit } = query;
  const pageNum = parseInt(page || "1", 10);
  const limitNum = parseInt(limit || "10", 10);
  const skip = (pageNum - 1) * limitNum;

  const whereClause: any = { deletedAt: null };
  if (search) whereClause.name = { contains: search, mode: "insensitive" };
  if (category) whereClause.category = category;
  if (location)
    whereClause.location = { contains: location, mode: "insensitive" };

  const orderByClause: any =
    sort === "asc" || sort === "desc"
      ? { startDate: sort }
      : { createdAt: "desc" };

  const [events, totalItems] = await prisma.$transaction([
    prisma.event.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take: limitNum,
      include: { ticketTypes: true },
    }),
    prisma.event.count({ where: whereClause }),
  ]);

  return {
    data: events,
    meta: {
      currentPage: pageNum,
      limit: limitNum,
      totalItems,
      totalPages: Math.ceil(totalItems / limitNum),
    },
  };
};

export const getEventService = async (id: number, filterType: 'day' | 'month' | 'year' = 'month') => {
  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePic: true,
          role: true,
        },
      },
      ticketTypes: true,
      vouchers: true,

      transactions: {
        where: {
          status: "DONE"
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
        orderBy: {createdAt: 'asc'},
      }
    },
  });
  if (!event) throw new ApiError("Event not found!", 404);

  const statsMap: {[key: string]: {revenue: number; ticketSold: number}} = {};
  event.transactions.forEach((tx) => {
    const date = new Date(tx.createdAt);
    let label = "";

    if (filterType === 'year') {
      label = date.getFullYear().toString();
    } else if (filterType === 'month') {
      label = date.toLocaleString('id-ID', {month: 'short', year: 'numeric'});
    } else {
      label = date.toLocaleString('id-ID', {day: '2-digit', month: 'short'});
    }

    const totalTicketsInTx = tx.items.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (!statsMap[label]) {
      statsMap[label] = {revenue: 0, ticketSold: 0};
    }

    statsMap[label].revenue += tx.totalPrice;
    statsMap[label].ticketSold += totalTicketsInTx;
  });

  const chartData = Object.keys(statsMap).map((label) => ({
    label,
    revenue: statsMap[label].revenue,
    ticketsSold: statsMap[label].ticketSold,
  }));

  return {
    ...event,
    statistics: chartData
  };
};

export const createEventService = async (body: CreateEventBody) => {
  const parsedOrganizerId = parseInt(body.organizerId as any, 10);
  const userExists = await prisma.user.findUnique({
    where: { id: parsedOrganizerId },
  });
  if (!userExists) throw new ApiError("Unauthorized: User not found.", 401);

  const event = await prisma.event.create({
    data: {
      name: body.name,
      description: body.description,
      location: body.location,
      category: body.category as any,
      bannerImage: body.bannerImage || "https://placehold.co/600x400",
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      organizerId: parsedOrganizerId,
      ticketTypes: {
        create:
          body.ticketTypes?.map((t) => ({
            name: t.name,
            price: Number(t.price),
            totalTicket: Number(t.totalTicket),
          })) || [],
      },
      vouchers: {
        create:
          body.vouchers?.map((v) => ({
            code: v.code.toUpperCase(),
            discount: Number(v.discount),
            quota: Number(v.quota),
            startDate: new Date(v.startDate),
            endDate: new Date(v.endDate),
          })) || [],
      },
    },
  });
  return { message: "Event created successfully.", data: event };
};

export const updateEventService = async (id: number, body: UpdateEventBody) => {
  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });
  if (!event) throw new ApiError("Event not found!", 404);

  // Gunakan Transaction untuk update event + replace ticketTypes
  return await prisma.$transaction(async (tx) => {
    const updatedEvent = await tx.event.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        category: body.category as any,
        bannerImage: body.bannerImage,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });

    // Jika ticketTypes dikirim, kita hapus yang lama dan buat yang baru (re-sync)
    if (body.ticketTypes) {
      await tx.ticketType.deleteMany({ where: { eventId: id } });
      await tx.ticketType.createMany({
        data: body.ticketTypes.map((t) => ({
          eventId: id,
          name: t.name,
          price: Number(t.price),
          totalTicket: Number(t.totalTicket),
        })),
      });
    }

    return { message: "Event updated successfully.", data: updatedEvent };
  });
};

export const deleteEventService = async (
  id: number,
): Promise<DeleteEventResponse> => {
  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });
  if (!event) throw new ApiError("Event not found!", 404);
  await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  return { message: "Event deleted successfully." };
};
