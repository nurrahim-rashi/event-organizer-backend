import { Request, Response } from "express";
import {
  getEventsService,
  getEventService,
  createEventService,
  updateEventService,
  deleteEventService,
  getEventAttendeeService,
} from "../services/event.service.js";
import { paginationQuerySchema } from "../validators/event.validator.js";
import { ApiError } from "../utils/api-error.js";

export const getEventsController = async (req: Request, res: Response) => {
  const query = paginationQuerySchema.parse(req.query);
  const result = await getEventsService(query);
  res.status(200).json(result);
};

export const getEventController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const filter = (req.query.filter as "day" | "month" | "year") || "month";

  const event = await getEventService(id, filter);

  res.status(200).json({
    success: true,
    data: event,
  });
};

export const createEventController = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };

    // Parse karena FormData mengirim data sebagai string
    if (body.ticketTypes) body.ticketTypes = JSON.parse(body.ticketTypes);
    if (body.vouchers) body.vouchers = JSON.parse(body.vouchers);

    const result = await createEventService(body, req.file);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateEventController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const body = { ...req.body };

    if (body.ticketTypes) body.ticketTypes = JSON.parse(body.ticketTypes);
    if (body.vouchers) body.vouchers = JSON.parse(body.vouchers);

    const result = await updateEventService(id, body, req.file);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteEventController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await deleteEventService(id);

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getEventAttendeeController = async (
  req: Request,
  res: Response,
) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new ApiError("Invalid event id", 400);
  }

  const result = await getEventAttendeeService(id);

  res.status(200).json({
    success: true,
    data: result,
  });
};
