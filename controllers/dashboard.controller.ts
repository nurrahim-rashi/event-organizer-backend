import { Request, Response, NextFunction } from "express";
import { getDashboardStatsService } from "../services/dashboard.service.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const getDashboardStatsController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = Number(req.user.id);
  const role = req.user.role;

  const stats = await getDashboardStatsService(userId, role);

  res.status(200).send({
    success: true,
    data: stats,
  });
};
