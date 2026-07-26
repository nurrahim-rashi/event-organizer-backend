import { forgotPasswordService, loginService, registerService, resetPasswordService } from "../services/auth.service.js";
export const registerController = async (req, res) => {
    const result = await registerService(req.body);
    res.status(200).send(result);
};
export const loginController = async (req, res) => {
    const result = await loginService(req.body);
    res.status(200).send(result);
};
export const forgotPasswordController = async (req, res) => {
    const result = await forgotPasswordService(req.body);
    res.status(200).send(result);
};
export const resetPasswordController = async (req, res) => {
    const userId = req.user.id;
    const result = await resetPasswordService(req.body, userId);
    res.status(200).send(result);
};
