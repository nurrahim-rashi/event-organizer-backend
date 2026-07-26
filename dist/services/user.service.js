import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";
export const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
export const getUsersService = async () => {
    return await prisma.user.findMany();
};
export const getUserService = async (id) => {
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
export const createUserService = async (body) => {
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
export const updateUserService = async (id, body, file) => {
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
export const deleteUserService = async (id) => {
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
