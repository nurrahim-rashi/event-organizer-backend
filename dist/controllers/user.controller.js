import { getUsersService, getUserService, createUserService, updateUserService, deleteUserService, } from "../services/user.service.js";
export const getUsersController = async (req, res) => {
    const users = await getUsersService();
    res.status(200).send({
        success: true,
        data: users,
    });
};
export const getUserController = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "ID User tidak valid" });
    }
    const user = await getUserService(id);
    res.status(200).send({
        success: true,
        data: user,
    });
};
export const createUserController = async (req, res) => {
    const result = await createUserService(req.body);
    res.status(201).send({
        success: true,
        ...result,
    });
};
export const updateUserController = async (req, res) => {
    const id = Number(req.params.id);
    const result = await updateUserService(id, req.body, req.file);
    res.status(200).send({
        success: true,
        ...result,
    });
};
export const deleteUserController = async (req, res) => {
    const id = Number(req.params.id);
    const result = await deleteUserService(id);
    res.status(200).send({
        success: true,
        ...result,
    });
};
