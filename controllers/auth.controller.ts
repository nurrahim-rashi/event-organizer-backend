import { NextFunction, Request, Response } from "express";
import { loginService, registerService } from "../services/auth.service.js";

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await registerService(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    };
};



export const loginController = async (req: Request, res: Response) => {
    const result = await loginService(req.body);
    res.status(200).send(result);
};