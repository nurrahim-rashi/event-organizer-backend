import express from "express";
import { upload } from "../middlewares/multer.js";
import * as eventController from "../controllers/event.controller.js";

export const eventRoutes = express.Router();

// Route POST dan PATCH harus pakai upload.single("file")
eventRoutes.post(
  "/",
  upload.single("file"),
  eventController.createEventController,
);
eventRoutes.patch(
  "/:id",
  upload.single("file"),
  eventController.updateEventController,
);

// Route GET tidak butuh multer
eventRoutes.get("/", eventController.getEventsController);
eventRoutes.get("/:id", eventController.getEventController);
eventRoutes.delete("/:id", eventController.deleteEventController);
