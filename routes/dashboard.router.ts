import express from "express";
import { getDashboardStatsController } from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get("/stats", verifyToken, getDashboardStatsController);

export { dashboardRoutes };
