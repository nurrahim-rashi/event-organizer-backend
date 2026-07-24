import { Request, Response } from "express";
import { getDashboardStatsService } from "../services/dashboard.service.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const getDashboardStatsController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = Number(req.user.id);
  const role = req.user.role;
  const {filter, eventId} = req.query;

  const stats = await getDashboardStatsService(
    userId, 
    role,
    filter as "day" | "month" | "year",
    eventId ? Number(eventId) : undefined
  );

  res.status(200).send({
    success: true,
    data: stats,
  });
};