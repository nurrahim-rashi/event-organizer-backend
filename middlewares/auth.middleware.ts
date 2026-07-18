import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";
import { Role } from "../generated/prisma/enums.js";

export interface MaybeAuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    role: string;
  };
}

export const verifyToken = (secretKey: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError("Unauthorized, token missing", 401);
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, secretKey) as {
        id: number;
        role: Role;
      };
      res.locals.user = { id: decoded.id, role: decoded.role };

      (req as AuthenticatedRequest).user = {
        id: decoded.id,
        role: decoded.role,
      };

      next();
    } catch (error: any) {
      next(new ApiError(error.message || "Invalid Token", 401));
    }
  };
};

export const verifyRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user) {
      throw new ApiError("Authentication required", 401);
    }

    if (!roles.includes(user.role)) {
      throw new ApiError("You don't have access.", 403);
    }

    next();
  };
};
