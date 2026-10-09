import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();

    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("workflowx_token");

        console.log("Socket Debug:", {
            userExists: !!user,
            tokenExists: !!token,
            socketURL:
                import.meta.env.VITE_SOCKET_URL ||
                "http://localhost:5000"
        });

        

        if (!token) {
            setSocket(null);
            setConnected(false);
            return;
        }


        const socketInstance = io(
            import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
            {
                auth: { token },
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000
            }
        );

        const handleConnect = () => {
            setConnected(true);
            console.log("Socket connected");
            console.log("Socket ID:", socketInstance.id);
        };

        const handleDisconnect = () => {
            setConnected(false);
        };

        const handleError = (error) => {
            setConnected(false);

            console.error("Socket connection failed:", {
                message: error.message,
                description: error.description,
                context: error.context,
                cause: error.cause
            });
        };

        socketInstance.on("connect", handleConnect);
        socketInstance.on("disconnect", handleDisconnect);
        socketInstance.on("connect_error", handleError);

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user?._id]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);

    if (!context) {
        throw new Error(
            "useSocket must be used inside SocketProvider"
        );
    }

    return context;
};