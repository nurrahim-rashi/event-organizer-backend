import { Request, Response } from "express";
import * as pointService from "../services/point.service.js";

export const getUserPoints = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const data = await pointService.getUserPointsService(
    Number(req.params.userId),
  );
  res.status(200).json({ success: true, data });
};

export const addPoints = async (req: Request, res: Response): Promise<void> => {
  const { points } = req.body;
  const data = await pointService.addPointsService(
    Number(req.params.userId),
    Number(points),
  );
  res.status(200).json({ success: true, data });
};
