import express from "express";
import "dotenv/config";
import { corsOptions } from "./config/cors.js";
import { userRoutes } from "./routes/user.routes.js";
import { eventRoutes } from "./routes/event.routes.js";
import { globalError, notFoundError } from "./utils/errors.js";
import { authRoutes } from "./routes/auth.routes.js";
import { ticketRoutes } from "./routes/ticket.routes.js";
import { dashboardRoutes } from "./routes/dashboard.router.js";
import { organizerRoutes } from "./routes/organizer.routes.js";
import { transactionRoutes } from "./routes/transaction.routes.js";
import { transactionCron } from "./scripts/transaction.js";
import { reminderCron } from "./scripts/reminder.js";

import cors from "cors";

const PORT = 8000;

const app = express();

// configs
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// entry points
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/tickets", ticketRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/organizers", organizerRoutes);
app.use("/transactions", transactionRoutes);

//errors
app.use(globalError);
app.use(notFoundError);

//crons
reminderCron();
transactionCron();

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
