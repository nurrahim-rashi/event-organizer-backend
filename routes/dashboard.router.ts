import express from "express";
import { getDashboardStatsController } from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { asAuthHandler } from "../utils/asAuthHandler.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get(
    "/stats",
    verifyToken(process.env.JWT_SECRET! as string), 
    asAuthHandler(getDashboardStatsController),
);

export { dashboardRoutes };
