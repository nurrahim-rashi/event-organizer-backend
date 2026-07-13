import { z } from "zod";

export interface PaginationQueryParams {
  page: number;
  take: number;
  sortOrder: string;
  sortBy: string;
  search: string;
}

export const paginationQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default(1),

  take: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default(10),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.string().default("createdAt"),
  search: z.string().default(""),
});
