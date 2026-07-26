import cors from "cors";

export const corsOptions = {
  origin: ["https://event-organizer-omega.vercel.app"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
