import { prisma } from "../lib/prisma.js";

export const createVoucherService = async (data: {
  code: string;
  discount: number;
  startDate: string;
  endDate: string;
  quota: number;
  eventId: number;
}) => {
  return await prisma.voucher.create({
    data: {
      code: data.code.toUpperCase(),
      discount: data.discount,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      quota: data.quota,
      eventId: data.eventId,
    },
  });
};

export const getVouchersService = async (eventId?: number) => {
  return await prisma.voucher.findMany({
    where: eventId ? { eventId } : {},
    include: { event: true },
  });
};

export const getVoucherByIdService = async (id: number) => {
  return await prisma.voucher.findUnique({
    where: { id },
    include: { event: true },
  });
};

export const updateVoucherService = async (id: number, data: any) => {
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);
  if (data.code) data.code = data.code.toUpperCase();

  return await prisma.voucher.update({
    where: { id },
    data,
  });
};

export const deleteVoucherService = async (id: number) => {
  return await prisma.voucher.delete({
    where: { id },
  });
};
