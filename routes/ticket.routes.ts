import { Router } from "express";
import {
  createTicketController,
  getTicketsByEventController,
  updateTicketController,
  deleteTicketController,
} from "../controllers/ticket.controller.js";

const router = Router();

router.post("/", createTicketController);
router.get("/event/:eventId", getTicketsByEventController);
router.put("/:id", updateTicketController);
router.delete("/:id", deleteTicketController);

export default router;
