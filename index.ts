import express from "express";
import { userRoutes } from "./routes/user.routes.js";
import { eventRoutes } from "./routes/event.routes.js";
import { globalError, notFoundError } from "./utils/errors.js";

const PORT = 8000;

const app = express();

app.use(express.json());

app.use("/users", userRoutes);
app.use("/events", eventRoutes);

app.use(globalError);
app.use(notFoundError);

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
