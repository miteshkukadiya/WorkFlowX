import express from "express";
import cors from "cors";
import errorMiddleware from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import ApiError from "./utils/ApiError.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";


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
)

export default app;