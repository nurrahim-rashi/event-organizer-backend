import { prisma } from "../lib/prisma.js";

export const createCouponService = async (data: {
  discount: number;
  expiredAt: string;
  userId: number;
}) => {
  return await prisma.coupon.create({
    data: {
      discount: data.discount,
      expiredAt: new Date(data.expiredAt),
      userId: data.userId,
    },
  });
};

export const getCouponsService = async (userId?: number) => {
  return await prisma.coupon.findMany({
    where: userId ? { userId } : {},
    include: { user: true },
  });
};

export const updateCouponService = async (id: number, data: any) => {
  if (data.expiredAt) data.expiredAt = new Date(data.expiredAt);
  return await prisma.coupon.update({
    where: { id },
    data,
  });
};

export const deleteCouponService = async (id: number) => {
  return await prisma.coupon.delete({
    where: { id },
  });
};
