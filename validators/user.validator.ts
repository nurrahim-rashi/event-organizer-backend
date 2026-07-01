import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";

export const createUserValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.body.name) {
    throw new ApiError("Name is required", 400);
  }

  next();
};
