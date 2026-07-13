import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import {
  createVoucherSchema,
  updateVoucherSchema,
} from "../validators/voucher.validator.js";

type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;

export const createVoucherService = async (data: CreateVoucherInput) => {
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

export const updateVoucherService = async (
  id: number,
  data: UpdateVoucherInput,
) => {
  const updateData: any = { ...data };

  if (updateData.startDate)
    updateData.startDate = new Date(updateData.startDate);
  if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

  return await prisma.voucher.update({
    where: { id },
    data: updateData,
  });
};

export const deleteVoucherService = async (id: number) => {
  return await prisma.voucher.delete({
    where: { id },
  });
};
