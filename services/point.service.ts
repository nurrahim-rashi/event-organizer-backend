import { prisma } from "../lib/prisma.js";

export const getUserPointsService = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  return user;
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
