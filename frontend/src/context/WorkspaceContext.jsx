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

export function WorkspaceProvider({ children }) {
    const { user } = useAuth();

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
            if (!user) {
                setWorkspaces([]);
                setActiveWorkspace(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const data = await organizationService.getAll();

                if (cancelled) return;

                setWorkspaces(data);

                const storedId = localStorage.getItem(
                    `workflowx_workspace_${user._id}`
                );

                const selected =
                    data.find(item => item._id === storedId) ||
                    data[0] ||
                    null;

                setActiveWorkspace(selected);
            } catch (error) {
                if (!cancelled) {
                    console.error("Unable to load workspaces", error);
                    setWorkspaces([]);
                    setActiveWorkspace(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadWorkspaces();

        return () => {
            cancelled = true;
        };
    }, [user?._id]);

    const switchWorkspace = (workspaceId) => {
        const selected = workspaces.find(
            item => item._id === workspaceId
        );

        if (!selected) return;

        setActiveWorkspace(selected);

        localStorage.setItem(
            `workflowx_workspace_${user._id}`,
            selected._id
        );
    };

    const refreshWorkspaces = async () => {
        const data = await organizationService.getAll();

        setWorkspaces(data);

        setActiveWorkspace(previous =>
            data.find(item => item._id === previous?._id) ||
            data[0] ||
            null
        );
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