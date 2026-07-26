import { Role } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";

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
  profilePic?: string;
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
  const currentDate = new Date();
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      coupons: {
        where: {
          expiredAt: {
            gt: currentDate,
          },
        },
      },
    },
  });

  if (!user) {
    throw new ApiError("User not found!", 404);
  }

  const pointsAggregate = await prisma.referralUsage.aggregate({
    _sum: {
      pointsEarned: true,
    },
    where: {
      referrerId: id,
      isPointUsed: false,
      expiredAt: {
        gt: currentDate,
      },
    },
  });

  const activePoints = pointsAggregate._sum.pointsEarned || 0;

  const { password, ...userWithoutPassword } = user;

  return {
    ...userWithoutPassword,
    activePoints,
  };
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

export const updateUserService = async (
  id: number,
  body: UpdateUserBody,
  file?: Express.Multer.File,
) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError("User not found!", 404);
  }

  let profilePic = body.profilePic;

  if (file) {
    const uploadResult = await cloudinaryUpload(file);
    profilePic = uploadResult.secure_url;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      password: body.password,
      profilePic,
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
