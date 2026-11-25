import {
    createContext,
    useContext,
    useEffect,
    useCallback,
    useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const updateUser = useCallback((updatedUser) => {
        if (updatedUser?.preferences?.timezone) {
            localStorage.setItem("workflowx_timezone", updatedUser.preferences.timezone);
        }
        setUser(current => current ? { ...current, ...updatedUser } : updatedUser);
    }, []);

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
        if (user.preferences?.timezone) {
            localStorage.setItem("workflowx_timezone", user.preferences.timezone);
        }

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
        localStorage.removeItem("workflowx_timezone");

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
                    if (response.data.data.preferences?.timezone) {
                        localStorage.setItem(
                            "workflowx_timezone",
                            response.data.data.preferences.timezone
                        );
                    }
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
                    localStorage.removeItem("workflowx_timezone");

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

    useEffect(() => {
        const theme = user?.preferences?.theme || "system";
        const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)");

        const applyTheme = () => {
            const resolvedTheme = theme === "system"
                ? (systemTheme?.matches ? "dark" : "light")
                : theme;
            document.documentElement.dataset.theme = resolvedTheme;
            document.documentElement.style.colorScheme = resolvedTheme;
        };

        applyTheme();
        if (theme === "system" && systemTheme) {
            systemTheme.addEventListener?.("change", applyTheme);
        }

        return () => {
            systemTheme?.removeEventListener?.("change", applyTheme);
        };
    }, [user?.preferences?.theme]);

    useEffect(() => {
        if (user?.preferences?.timezone) {
            localStorage.setItem("workflowx_timezone", user.preferences.timezone);
        } else {
            localStorage.removeItem("workflowx_timezone");
        }
    }, [user?.preferences?.timezone]);

    return (

        <AuthContext.Provider
            value={{
                user,
                loading,
                updateUser,
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