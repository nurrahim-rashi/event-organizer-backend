import { z } from "zod";

export const getEventsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  sort: z
    .enum(["newest", "oldest", "price_low", "price_high"])
    .default("newest"),
  page: z.string().transform(Number).pipe(z.number().min(1)).default(1),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default(10),
});
