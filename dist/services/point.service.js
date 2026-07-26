import { prisma } from "../lib/prisma.js";
export const getUserPointsService = async (userId) => {
    const currentDate = new Date();
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            referralSent: {
                where: {
                    expiredAt: { gt: currentDate },
                    isPointUsed: false,
                },
                select: {
                    pointsEarned: true,
                },
            },
        }
    });
    if (!user)
        return null;
    const totalPoints = user.referralSent.reduce((sum, item) => sum + item.pointsEarned, 0);
    return {
        id: user.id,
        totalPoints,
    };
};
export const addPointsService = async (userId, pointsToAdd) => {
    return {
        message: `Points logic ready. Simulated adding ${pointsToAdd} points to user ${userId}`,
    };
};
export const deductPointsService = async (userId, pointsToDeduct) => {
    return {
        message: `Points logic ready. Simulated deducting ${pointsToDeduct} points from user ${userId}`,
    };
};
