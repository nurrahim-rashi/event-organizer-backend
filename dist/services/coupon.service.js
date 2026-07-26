import { prisma } from "../lib/prisma.js";
export const createCouponService = async (data) => {
    return await prisma.coupon.create({
        data: {
            discount: data.discount,
            expiredAt: new Date(data.expiredAt),
            userId: data.userId,
        },
    });
};
export const getCouponsService = async (userId) => {
    return await prisma.coupon.findMany({
        where: userId ? { userId } : {},
        include: { user: true },
    });
};
export const updateCouponService = async (id, data) => {
    if (data.expiredAt)
        data.expiredAt = new Date(data.expiredAt);
    return await prisma.coupon.update({
        where: { id },
        data,
    });
};
export const deleteCouponService = async (id) => {
    return await prisma.coupon.delete({
        where: { id },
    });
};
