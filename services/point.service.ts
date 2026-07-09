import { prisma } from "../lib/prisma.js";

export const getUserPointsService = async (userId: number) => {
  const currentDate = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include : {
      referralSent : {
        where: {
          expiredAt: {gt: currentDate},
          isPointUsed: false,
        },

        select: {
          pointsEarned: true,
        },
      },
    }
  });
  if (!user) return null;

  const totalPoints = user.referralSent.reduce((sum, item) => sum + item.pointsEarned, 0);

  return {
    id: user.id,
    totalPoints,
  };
};

export const addPointsService = async (userId: number, pointsToAdd: number) => {
  return {
    message: `Points logic ready. Simulated adding ${pointsToAdd} points to user ${userId}`,
  };
};

export const deductPointsService = async (
  userId: number,
  pointsToDeduct: number,
) => {
  return {
    message: `Points logic ready. Simulated deducting ${pointsToDeduct} points from user ${userId}`,
  };
};
