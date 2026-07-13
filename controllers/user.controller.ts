import { Request, Response, NextFunction } from "express";
import {
  getUsersService,
  getUserService,
  createUserService,
  updateUserService,
  deleteUserService,
} from "../services/user.service.js";

export const getUsersController = async (req: Request, res: Response) => {
  const users = await getUsersService();

  res.status(200).send({
    success: true,
    data: users,
  });
};

export const getUserController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const user = await getUserService(id);

  res.status(200).send({
    success: true,
    data: user,
  });
};

export const createUserController = async (req: Request, res: Response) => {
  const result = await createUserService(req.body);

  res.status(201).send({
    success: true,
    ...result,
  });
};

export const updateUserController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await updateUserService(id, req.body, req.file);

  res.status(200).send({
    success: true,
    ...result,
  });
};

export const deleteUserController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await deleteUserService(id);

  res.status(200).send({
    success: true,
    ...result,
  });
};
