import { getIO } from "../../socket/socket.js";

export const emitToProject = (projectId, event, data) => {
    const io = getIO();

    if (!io || !projectId) return;

    io.to(`project:${projectId}`).emit(event, data);
};

export const emitToUser = (userId, event, data) => {
    const io = getIO();

    if (!io || !userId) return;

    io.to(`user:${userId}`).emit(event, data);
};