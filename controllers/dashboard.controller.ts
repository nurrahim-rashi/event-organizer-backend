import { Request, Response } from "express";
import { getDashboardStatsService } from "../services/dashboard.service.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const getDashboardStatsController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  console.log("--- DEBUG: Controller stats dipanggil ---");
  const userId = Number(req.user.id);
  const role = req.user.role;

  console.log(`--- DEBUG: Memanggil service untuk userId: ${userId}, role: ${role} ---`);

  const stats = await getDashboardStatsService(userId, role);

  console.log("--- DEBUG: Service berhasil mengembalikan data, mengirim response ---");

  res.status(200).send({
    success: true,
    data: stats,
  });
};
