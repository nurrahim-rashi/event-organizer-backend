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
    console.log("--- DEBUG: Masuk ke verifyToken ---");
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("--- DEBUG: Token hilang atau format salah ---");
        throw new ApiError("Unauthorized, token missing", 401);
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, secretKey) as {
        id: number;
        role: Role;
      };
      console.log("--- DEBUG: Token berhasil diverifikasi untuk user:", decoded.id, " ---");
      res.locals.user = { id: decoded.id, role: decoded.role };

      (req as AuthenticatedRequest).user = {
        id: decoded.id,
        role: decoded.role,
      };

      next();
    } catch (error: any) {
      console.log("--- DEBUG: Gagal di verifyToken:", error.message, " ---");
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
