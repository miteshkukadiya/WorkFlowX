import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Login
    const login = async (email, password) => {

        const response = await api.post("/auth/login", {
            email,
            password
        });

        const { user, token } = response.data.data;

        if (!user || !token) {
            throw new Error("Invalid login response");
        }

        localStorage.setItem("workflowx_token", token);

        setUser(user);

        return user;
    };

    // Register
    const register = async (name, email, password) => {

        const response = await api.post("/auth/register", {
            name,
            email,
            password
        });

        return response.data.data;
    };

    // Logout
    const logout = () => {

        localStorage.removeItem("workflowx_token");

        setUser(null);
    };

    // Fetch current user
    useEffect(() => {

        let active = true;

        const fetchCurrentUser = async () => {

            const token = localStorage.getItem(
                "workflowx_token"
            );

            if (!token) {
                if (active) setLoading(false);
                return;
            }

            try {

                const response = await api.get("/auth/me");

                if (active) {
                    setUser(response.data.data);
                }

            } catch (error) {

                console.error(
                    "Authentication failed:",
                    error
                );

                if (active) {
                    localStorage.removeItem(
                        "workflowx_token"
                    );

                    setUser(null);
                }

            } finally {

                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchCurrentUser();

        return () => {
            active = false;
        };

    }, []);

    return (

        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>

    );
};

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};