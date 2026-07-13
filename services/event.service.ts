import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { PaginationQueryParams } from "../validators/event.validator.js";

export const getEventsService = async (query: PaginationQueryParams) => {
  const { page, take, sortOrder, sortBy, search } = query;
  const skip = (page - 1) * take;

  const whereClause: any = {
    deletedAt: null,
    ...(search && { name: { contains: search, mode: "insensitive" } }),
  };

  const orderByClause = { [sortBy]: sortOrder };

  const [events, totalItems] = await prisma.$transaction([
    prisma.event.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take,
      include: { ticketTypes: true },
    }),
    prisma.event.count({ where: whereClause }),
  ]);

  return {
    data: events,
    meta: {
      currentPage: page,
      limit: take,
      totalItems,
      totalPages: Math.ceil(totalItems / take),
    },
  };
};

export const getEventService = async (
  id: number,
  filterType: "day" | "month" | "year" = "month",
) => {
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
        where: { status: "DONE" },
        select: {
          totalPrice: true,
          createdAt: true,
          items: { select: { qty: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!event) throw new ApiError("Event not found!", 404);
  return event;
};

export const createEventService = async (body: any) => {
  const event = await prisma.event.create({
    data: {
      name: body.name,
      description: body.description,
      location: body.location,
      category: body.category,
      bannerImage: body.bannerImage || "https://placehold.co/600x400",
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      organizerId: Number(body.organizerId),
    },
  });
  return { message: "Event created successfully.", data: event };
};

export const updateEventService = async (id: number, body: any) => {
  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });
  if (!event) throw new ApiError("Event not found!", 404);

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      location: body.location,
      category: body.category,
      bannerImage: body.bannerImage,
    },
  });
  return { message: "Event updated successfully.", data: updatedEvent };
};

export const deleteEventService = async (id: number) => {
  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });
  if (!event) throw new ApiError("Event not found!", 404);

  await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  return { message: "Event deleted successfully." };
};
