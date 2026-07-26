import cors from "cors";

export const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
