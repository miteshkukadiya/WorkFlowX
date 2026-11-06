import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { organizationService } from "../services/organizationService";
import { useAuth } from "./AuthContext";
import { setActiveOrganizationId } from "../utils/workspaceSession";

const WorkspaceContext = createContext(null);

const getWorkspaceCacheKey = (userId) =>
    `workflowx_workspaces_${userId}`;

export function WorkspaceProvider({ children }) {
    const { user } = useAuth();
    const userId = user?.id || user?._id || null;

    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setActiveOrganizationId(
            activeWorkspace?._id || null
        );

        return () => {
            setActiveOrganizationId(null);
        };
    }, [activeWorkspace?._id]);

    useEffect(() => {
        let cancelled = false;

        const loadWorkspaces = async () => {
            if (!userId) {
                setWorkspaces([]);
                setActiveWorkspace(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const cacheKey = getWorkspaceCacheKey(userId);
                const cached = JSON.parse(
                    localStorage.getItem(cacheKey) || "[]"
                );

                if (Array.isArray(cached) && cached.length > 0) {
                    setWorkspaces(cached);

                    const storedId = localStorage.getItem(
                        `workflowx_workspace_${userId}`
                    );
                    const cachedSelected =
                        cached.find(item => item._id === storedId) ||
                        cached[0];

                    setActiveOrganizationId(cachedSelected._id);
                    setActiveWorkspace(cachedSelected);
                }

                const data = await organizationService.getAll();

                if (cancelled) return;

                if (!Array.isArray(data)) {
                    throw new Error("Invalid workspace response");
                }

                setWorkspaces(data);
                localStorage.setItem(cacheKey, JSON.stringify(data));

                const storedId = localStorage.getItem(
                    `workflowx_workspace_${userId}`
                );

                const selected =
                    data.find(item => item._id === storedId) ||
                    data[0] ||
                    null;

                setActiveOrganizationId(selected?._id || null);

                if (selected) {
                    localStorage.setItem(
                        `workflowx_workspace_${userId}`,
                        selected._id
                    );
                }

                setActiveWorkspace(selected);
            } catch (error) {
                if (!cancelled) {
                    console.error("Unable to load workspaces", error);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadWorkspaces();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const switchWorkspace = (workspaceId) => {
        const selected = workspaces.find(
            item => item._id === workspaceId
        );

        if (!selected) return;

        setActiveWorkspace(selected);
        setActiveOrganizationId(selected._id);

        localStorage.setItem(
            `workflowx_workspace_${userId}`,
            selected._id
        );
    };

    // const refreshWorkspaces = async () => {
    //     const data = await organizationService.getAll();

    //     setWorkspaces(data);

    //     setActiveWorkspace(previous =>
    //         data.find(item => item._id === previous?._id) ||
    //         data[0] ||
    //         null
    //     );
    // };

    const refreshWorkspaces = async (preferredWorkspaceId = null) => {
        try {
            const data = await organizationService.getAll();

            if (!Array.isArray(data)) {
                throw new Error("Invalid workspace response");
            }

            setWorkspaces(data);
            localStorage.setItem(
                getWorkspaceCacheKey(userId),
                JSON.stringify(data)
            );

            const storedId = localStorage.getItem(
                `workflowx_workspace_${userId}`
            );

            const selected =
                data.find(item => item._id === preferredWorkspaceId) ||
                data.find(item => item._id === storedId) ||
                data.find(item => item._id === activeWorkspace?._id) ||
                data[0] ||
                null;

            setActiveWorkspace(selected);

            if (selected) {
                setActiveOrganizationId(selected._id);
                localStorage.setItem(
                    `workflowx_workspace_${userId}`,
                    selected._id
                );
            } else {
                setActiveOrganizationId(null);
            }

            return selected;
        } catch (error) {
            console.error("Workspace refresh failed:", error);
            throw error;
        }
    };

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                activeWorkspace,
                loading,
                switchWorkspace,
                refreshWorkspaces
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);

    if (!context) {
        throw new Error(
            "useWorkspace must be used inside WorkspaceProvider"
        );
    }

    return context;
}