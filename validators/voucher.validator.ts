import { z } from "zod";

export const createVoucherSchema = z.object({
  code: z
    .string()
    .min(1)
    .transform((val) => val.toUpperCase()),
  discount: z.preprocess((val) => Number(val), z.number().min(0)),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  quota: z.preprocess((val) => Number(val), z.number().int().min(0)),
  eventId: z.preprocess((val) => Number(val), z.number().int()),
});

export const updateVoucherSchema = z.object({
  code: z
    .string()
    .min(1)
    .transform((val) => val.toUpperCase())
    .optional(),
  discount: z.preprocess((val) => Number(val), z.number().min(0)).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  quota: z.preprocess((val) => Number(val), z.number().int().min(0)).optional(),
  eventId: z.preprocess((val) => Number(val), z.number().int()).optional(),
});
