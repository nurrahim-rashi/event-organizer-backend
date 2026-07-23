import { Request } from "express";

export const baseQuery = (req: Request) => {
  return {
    page: parseInt(req.query.page as string) || 1,
    take: parseInt(req.query.take as string) || 9,
    sortOrder: (req.query.sortOrder as string) || "desc",
    sortBy: (req.query.sortBy as string) || "createdAt",
    search: (req.query.search as string) || "",
    location: (req.query.location as string) || "",
    category: (req.query.category as string) || "",
  };
};
