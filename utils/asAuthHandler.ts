import { RequestHandler, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

type AuthHandler = (
    req: AuthenticatedRequest,
    res: Response
) => Promise<void> | void;

export const asAuthHandler = (handler: AuthHandler) : RequestHandler => {
    return handler as unknown as RequestHandler;
};