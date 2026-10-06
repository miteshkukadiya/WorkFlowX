import express from "express";
import cors from "cors";
import errorMiddleware from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import ApiError from "./utils/ApiError.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import timeEntryRoutes from "./routes/timeEntry.routes.js";
import userRoutes from "./routes/user.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import attachmentRoutes from "./routes/attachment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";


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

app.use(
    "/api/v1/comments",
    commentRoutes
);

app.use(
    "/api/v1/activities",
    activityRoutes
);

app.use(
    "/api/v1/attachments",
    attachmentRoutes
);

app.use(
    "/api/v1/notifications",
    notificationRoutes
);

app.use(
    "/api/v1/reports",
    reportRoutes
);

export default app;