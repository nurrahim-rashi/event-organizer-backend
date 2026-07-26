import { Router } from "express";
import { createTicketController, getTicketsByEventController, updateTicketController, deleteTicketController, } from "../controllers/ticket.controller.js";
export const ticketRoutes = Router();
ticketRoutes.post("/", createTicketController);
ticketRoutes.get("/event/:eventId", getTicketsByEventController);
ticketRoutes.put("/:id", updateTicketController);
ticketRoutes.delete("/:id", deleteTicketController);
