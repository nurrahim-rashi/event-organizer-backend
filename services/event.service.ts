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
};

type UpdateEventBody = {
  name?: string;
  description?: string;
  location?: string;
  category?: string;
  bannerImage?: string;
  startDate?: string;
  endDate?: string;
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

  // 1. Konfigurasi Default Pagination
  const pageNum = parseInt(page || "1", 10);
  const limitNum = parseInt(limit || "10", 10);
  const skip = (pageNum - 1) * limitNum;

  // 2. "Where" clause
  const whereClause: any = {
    deletedAt: null,
  };

  if (search) {
    whereClause.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (category) {
    whereClause.category = category;
  }

  if (location) {
    whereClause.location = {
      contains: location,
      mode: "insensitive",
    };
  }

  // 3. Bangun Sorting Clause
  const orderByClause: any = {};
  if (sort === "asc" || sort === "desc") {
    orderByClause.startDate = sort;
  } else {
    orderByClause.createdAt = "desc";
  }

  // 4. Eksekusi Query paralel
  const [events, totalItems] = await prisma.$transaction([
    prisma.event.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip: skip,
      take: limitNum,
    }),
    prisma.event.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limitNum);

  return {
    data: events,
    meta: {
      currentPage: pageNum,
      limit: limitNum,
      totalItems,
      totalPages,
    },
  };
};

export const getEventService = async (id: number) => {
  const event = await prisma.event.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!event) {
    throw new ApiError("Event not found!", 404);
  }

  return event;
};

export const createEventService = async (body: CreateEventBody) => {
  const event = await prisma.event.create({
    data: {
      name: body.name,
      description: body.description,
      location: body.location,
      category: body.category as any,
      bannerImage: body.bannerImage,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      organizerId: body.organizerId,
    },
  });

  return {
    message: "Event created successfully.",
    data: event,
  };
};

export const updateEventService = async (id: number, body: UpdateEventBody) => {
  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });

  if (!event) {
    throw new ApiError("Event not found!", 404);
  }

  const updatedEvent = await prisma.event.update({
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

  return {
    message: "Event updated successfully.",
    data: updatedEvent,
  };
};

export const deleteEventService = async (
  id: number,
): Promise<DeleteEventResponse> => {
  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });

  if (!event) {
    throw new ApiError("Event not found!", 404);
  }

  await prisma.event.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return {
    message: "Event deleted successfully.",
  };
};
