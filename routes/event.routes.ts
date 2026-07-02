import { Router } from "express";
import { EventController } from "../controllers/event.controller.js";

export class eventRoutes {
  private router: Router;
  private eventController: EventController;

  constructor() {
    this.router = Router();
    this.eventController = new EventController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/", this.eventController.createEvent);

    this.router.get("/", this.eventController.getEvents);

    this.router.get("/:id", this.eventController.getEventById);

    this.router.patch("/:id", this.eventController.updateEvent);

    this.router.delete("/:id", this.eventController.deleteEvent);
  }

  getRouter(): Router {
    return this.router;
  }
}
