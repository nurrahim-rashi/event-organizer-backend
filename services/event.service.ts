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

export const getEventsService = async () => {
  return await prisma.event.findMany({
    where: {
      deletedAt: null,
    },
  });
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
