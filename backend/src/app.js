import express from "express";
import cors from "cors";
import errorMiddleware from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import ApiError from "./utils/ApiError.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import timeEntryRoutes from "./routes/timeEntry.routes.js";
import userRoutes from "./routes/user.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth" , authRoutes);


// error handler
app.use(errorMiddleware);

app.use(
    "/api/v1/projects",
    projectRoutes
);

app.use(
    "/api/v1/tasks",
    taskRoutes
);

app.use(
    "/api/v1/time",
    timeEntryRoutes
);

app.use(
    "/api/v1/users",
    userRoutes
);

export default app;