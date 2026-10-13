import express from "express";
import cors from "cors";
import path from "path";
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
import dashboardRoutes from "./routes/dashboard.routes.js";
import taskSearchRoutes from "./routes/taskSearch.routes.js";
import savedViewRoutes from "./routes/savedView.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

import { securityHeaders, corsMiddleware, apiLimiter, authLimiter } from "./middleware/security.middleware.js";

import {notFound, errorHandler } from "./middleware/error.middleware.js";

import pinoHttp from "pino-http";
import { logger } from "./config/logger.js";

import healthRoutes from "./routes/health.routes.js";

const app = express();

app.use(cors());

// 1. Security headers
app.use(securityHeaders);

// 2. CORS
app.use(corsMiddleware);

// 3. Body parsing
app.use(express.json({
    limit: "100kb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "100kb"
}));

// 4. General API rate limit
app.use("/api/v1", apiLimiter);

app.use(
    pinoHttp({
        logger,
        redact: [
            "req.headers.authorization",
            "req.headers.cookie"
        ]
    })
);

app.use("/api/v1/auth", authLimiter, authRoutes);



app.use("/api/v1/auth" , authLimiter, authRoutes);


app.use(
    "/api/v1/projects",
    projectRoutes
);

app.use(
        "/api/v1/tasks/search", 
        taskSearchRoutes
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

app.use(
    "/api/v1/dashboard",
    dashboardRoutes
);

app.use(
    "/api/v1/saved-views", 
    savedViewRoutes
);

app.use(
    "/api/v1/settings",
    settingsRoutes
);

app.use(
    "/uploads/avatars",
    express.static(
        path.resolve("uploads", "avatars")
    )
);

// 11. Handle unknown routes
app.use(notFound);

// 12. Centralized error handler
app.use(errorHandler);


// error handler
app.use(errorMiddleware);

export default app;