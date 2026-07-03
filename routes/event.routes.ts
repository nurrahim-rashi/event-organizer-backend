import express from "express";
import {
  createEventController,
  getEventsController,
  getEventController,
  updateEventController,
  deleteEventController,
} from "../controllers/event.controller.js";

export const eventRoutes = express.Router();

eventRoutes.get("/", getEventsController);
eventRoutes.get("/:id", getEventController);
eventRoutes.post("/", createEventController);
eventRoutes.patch("/:id", updateEventController);
eventRoutes.delete("/:id", deleteEventController);
