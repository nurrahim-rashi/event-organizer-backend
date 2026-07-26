import { prisma } from "../lib/prisma.js";
export const createVoucherService = async (data) => {
    return await prisma.voucher.create({
        data: {
            code: data.code,
            discount: data.discount,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            quota: data.quota,
            eventId: data.eventId,
        },
    });
};
export const getVouchersService = async (eventId) => {
    return await prisma.voucher.findMany({
        where: eventId ? { eventId } : {},
        include: { event: true },
    });
};
export const getVoucherByIdService = async (id) => {
    return await prisma.voucher.findUnique({
        where: { id },
        include: { event: true },
    });
};
export const updateVoucherService = async (id, data) => {
    const updateData = { ...data };
    if (updateData.startDate)
        updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate)
        updateData.endDate = new Date(updateData.endDate);
    return await prisma.voucher.update({
        where: { id },
        data: updateData,
    });
};
export const deleteVoucherService = async (id) => {
    return await prisma.voucher.delete({
        where: { id },
    });
};
