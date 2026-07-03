import { Role } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

type CreateUserBody = {
  name: string;
  email: string;
  password: string;
  role?: Role; 
};

type UpdateUserBody = {
  name?: string;
  email?: string;
  password?: string;
};

type DeleteUserResponse = {
  message: string;
};

export const generateReferralCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export const getUsersService = async () => {
  return await prisma.user.findMany();
};

export const getUserService = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError("User not found!", 404);
  }

  return user;
};

export const createUserService = async (body: CreateUserBody) => {
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role || "USER",
      referralCode: generateReferralCode(),
    },
  });

  return {
    message: "User created successfully.",
    data: user,
  };
};

export const updateUserService = async (id: number, body: UpdateUserBody) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError("User not found!", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      password: body.password,
    },
  });

  return {
    message: "User updated successfully.",
    data: updatedUser,
  };
};

export const deleteUserService = async (
  id: number,
): Promise<DeleteUserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError("User not found!", 404);
  }

  await prisma.user.delete({
    where: { id },
  });

  return {
    message: "User deleted successfully.",
  };
};
