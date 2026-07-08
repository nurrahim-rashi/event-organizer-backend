import { Request, Response, NextFunction } from "express";
import { getOrganizerProfileData } from "../services/organizer.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const id = (req.query.id as string) || "";
  const organizerId = parseInt(id, 10);

  if (isNaN(organizerId)) {
    const error = new Error("Invalid Organizer ID format");
    (error as any).status = 400;
    throw error;
  }

  const profileData = await getOrganizerProfileData(organizerId);

  res.status(200).json(profileData);
});
