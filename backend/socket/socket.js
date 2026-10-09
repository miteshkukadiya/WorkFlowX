import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import User from "../src/models/User.js";
import Project from "../src/models/Project.js";

let io = null;

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true
        }
    });

    // Authenticate socket connection
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            const userId =
                decoded.id || decoded.userId || decoded._id;

            if (!userId) {
                return next(new Error("Invalid token payload"));
            }

            const user = await User.findById(userId)
                .select("_id name email");

            if (!user) {
                return next(new Error("User not found"));
            }

            socket.user = user;
            next();

        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = String(socket.user._id);

        console.log("Socket connected:", socket.id);

        // Private room for this user
        socket.join(`user:${userId}`);

        // Join only projects this user can access
        socket.on("project:join", async (projectId, ack) => {
            try {
                const project = await Project.findById(projectId);

                if (!project) {
                    ack?.({ success: false, message: "Project not found" });
                    return;
                }

                const isOwner =
                    String(project.owner) === userId;

                const isMember = project.members.some(
                    member => String(member) === userId
                );

                if (!isOwner && !isMember) {
                    ack?.({ success: false, message: "Access denied" });
                    return;
                }

                socket.join(`project:${projectId}`);

                ack?.({ success: true });

            } catch (error) {
                ack?.({ success: false, message: "Unable to join project" });
            }
        });

        socket.on("project:leave", (projectId) => {
            socket.leave(`project:${projectId}`);
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });
    });

    return io;
};

export const getIO = () => io;