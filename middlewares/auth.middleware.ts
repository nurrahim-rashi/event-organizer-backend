import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";

export interface MaybeAuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    role: string;
  };
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError("Unauthorized, token missing", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };

    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    next(new ApiError(error.message || "Invalid Token", 401));
  }
};
