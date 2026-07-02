import { Request, Response } from "express";
import { loginService } from "../services/auth.service.js";

export const loginController = async (req: Request, res: Response) => {
    const result = await loginService(req.body);
    res.status(200).send(result);
}