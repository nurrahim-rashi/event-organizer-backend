import express from "express";
import { userRoutes } from "./routes/user.routes.js";
import { eventRoutes } from "./routes/event.routes.js";
import { globalError, notFoundError } from "./utils/errors.js";
import { authRoutes } from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
<<<<<<< Updated upstream
import { dashboardRoutes } from "./routes/dashboard.router.js";
=======
import organizerRoutes from "./routes/organizer.routes.js";
>>>>>>> Stashed changes

import cors from "cors";

const PORT = 8000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/tickets", ticketRoutes);
<<<<<<< Updated upstream
app.use("/dashboard", dashboardRoutes);
=======
app.use("/organizers", organizerRoutes);
>>>>>>> Stashed changes

app.use(globalError);
app.use(notFoundError);

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
