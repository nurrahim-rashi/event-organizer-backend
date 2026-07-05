import { Request, Response, NextFunction } from "express";
import {
  createTicketService,
  getTicketsByEventService,
  updateTicketService,
  deleteTicketService,
} from "../services/ticket.service.js";

export const createTicketController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await createTicketService(req.body);

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getTicketsByEventController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const eventId = Number(req.params.eventId);

    const result = await getTicketsByEventService(eventId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTicketController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const result = await updateTicketService(id, req.body);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTicketController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const result = await deleteTicketService(id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
