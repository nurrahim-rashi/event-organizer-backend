import { Request, Response, NextFunction } from "express";
import { getDashboardStatsService } from "../services/dashboard.service.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const getDashboardStatsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(400).json({ sucess: false, message: "Unauthorized" });
    }

    const userId = Number(req.user.id);
    const role = req.user.role;

    const stats = await getDashboardStatsService(userId, role);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};
