import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

export const useProjectSocket = (
    projectId,
    eventHandlers = {}
) => {
    const { socket, connected } = useSocket();

    useEffect(() => {
        if (!socket || !projectId) return;

        const joinProject = () => {
            socket.emit(
                "project:join",
                projectId,
                (response) => {
                    if (!response?.success) {
                        console.warn(
                            "Project room join failed:",
                            response?.message
                        );
                    }
                }
            );
        };

        // Register event listeners
        Object.entries(eventHandlers).forEach(
            ([event, handler]) => {
                socket.on(event, handler);
            }
        );

        if (socket.connected) {
            joinProject();
        }

        socket.on("connect", joinProject);

        return () => {
            socket.off("connect", joinProject);

            Object.entries(eventHandlers).forEach(
                ([event, handler]) => {
                    socket.off(event, handler);
                }
            );

            if (socket.connected) {
                socket.emit("project:leave", projectId);
            }
        };
    }, [socket, projectId, connected, ...Object.values(eventHandlers)]);
};