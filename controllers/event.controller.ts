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
  const result = await createEventService(req.body);

  res.status(201).json({
    success: true,
    ...result,
  });
};

export const updateEventController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await updateEventService(id, req.body);

  res.status(200).json({
    success: true,
    ...result,
  });
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
