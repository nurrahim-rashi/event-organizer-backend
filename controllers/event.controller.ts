import { Request, Response, NextFunction } from "express";
import {
  getEventsService,
  getEventService,
  createEventService,
  updateEventService,
  deleteEventService,
} from "../services/event.service.js";

export const getEventsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const events = await getEventsService();

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (err) {
    next(err);
  }
};

export const getEventController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const event = await getEventService(id);

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

export const createEventController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await createEventService(req.body);

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateEventController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const result = await updateEventService(id, req.body);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteEventController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const result = await deleteEventService(id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
