import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { PaginationQueryParams } from "../validators/event.validator.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";

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

export const createEventService = async (
  body: any,
  file?: Express.Multer.File,
) => {
  // Pastikan bannerImageUrl diinisialisasi dengan aman
  let bannerImageUrl = "";

  if (file) {
    const uploadResult = await cloudinaryUpload(file);
    bannerImageUrl = uploadResult.secure_url;
  } else {
    bannerImageUrl = body.bannerImage || "";
  }

  const event = await prisma.event.create({
    data: {
      name: body.name,
      description: body.description,
      location: body.location,
      category: body.category,
      bannerImage: bannerImageUrl,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      organizerId: Number(body.organizerId),
      ticketTypes: { create: body.ticketTypes || [] },
      vouchers: { create: body.vouchers || [] },
    },
    include: { ticketTypes: true, vouchers: true },
  });

  return { message: "Event created successfully.", data: event };
};

export const updateEventService = async (
  id: number,
  body: any,
  file?: Express.Multer.File,
) => {
  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
    include: { ticketTypes: true }, // Pastikan include ticketTypes
  });

  if (!event) throw new ApiError("Event not found!", 404);

  let bannerImageUrl = event.bannerImage;
  if (file) {
    const uploadResult = await cloudinaryUpload(file);
    bannerImageUrl = uploadResult.secure_url;
  }

  return await prisma.$transaction(async (tx) => {
    // Update data event dasar
    const updatedEvent = await tx.event.update({
      where: { id },
      data: {
        name: body.name || event.name,
        description: body.description || event.description,
        location: body.location || event.location,
        category: body.category || event.category,
        bannerImage: bannerImageUrl,
        startDate: body.startDate ? new Date(body.startDate) : event.startDate,
        endDate: body.endDate ? new Date(body.endDate) : event.endDate,
      },
    });

    // Update TicketTypes secara satu-persatu (Upsert)
    if (body.ticketTypes && Array.isArray(body.ticketTypes)) {
      for (const ticket of body.ticketTypes) {
        if (ticket.id) {
          // Update jika sudah ada id
          await tx.ticketType.update({
            where: { id: ticket.id },
            data: {
              name: ticket.name,
              price: ticket.price,
              totalTicket: ticket.totalTicket,
            },
          });
        } else {
          // Buat baru jika tidak ada id
          await tx.ticketType.create({
            data: {
              ...ticket,
              eventId: id,
            },
          });
        }
      }
    }

    return updatedEvent;
  });
};

export const deleteEventService = async (id: number) => {
  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });
  if (!event) throw new ApiError("Event not found!", 404);

  await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  return { message: "Event deleted successfully." };
};

export const getEventAttendeeService = async (eventId: number) => {
  const attendees = await prisma.transaction.findMany({
    where: {
      eventId,
      status: "DONE",
    },
    select: {
      id: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return attendees;
};
