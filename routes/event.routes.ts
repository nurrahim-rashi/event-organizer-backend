import express from "express";
import { getEventsController, 
  getEventController, 
  createEventController, 
  updateEventController, 
  deleteEventController } from "../controllers/event.controller.js";


const eventRoutes = express.Router();

eventRoutes.post("/", createEventController);
eventRoutes.get("/", getEventsController);
eventRoutes.get("/:id", getEventController);
eventRoutes.patch("/:id", updateEventController);
eventRoutes.delete("/:id", deleteEventController);

export { eventRoutes };
