import z from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  content: z.string().min(1, "Content is required"),
});

export type createEventSchema = z.infer<typeof createEventSchema>;
