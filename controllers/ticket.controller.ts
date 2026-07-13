import { Request, Response } from "express";
import {
  createTicketService,
  getTicketsByEventService,
  updateTicketService,
  deleteTicketService,
} from "../services/ticket.service.js";

export const createTicketController = async (req: Request, res: Response) => {
  const result = await createTicketService(req.body);

  res.status(201).json({
    success: true,
    ...result,
  });
};

export const getTicketsByEventController = async (
  req: Request,
  res: Response,
) => {
  const eventId = Number(req.params.eventId);
  const result = await getTicketsByEventService(eventId);

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const updateTicketController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await updateTicketService(id, req.body);

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const deleteTicketController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await deleteTicketService(id);

  res.status(200).json({
    success: true,
    ...result,
  });
};
