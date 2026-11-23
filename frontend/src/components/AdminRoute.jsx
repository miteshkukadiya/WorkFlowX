import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { platformAdminService } from "../services/platformAdminService";

export default function AdminRoute() {
    const [state, setState] = useState({
        loading: true,
        allowed: false
    });

    useEffect(() => {
        let mounted = true;

        platformAdminService.getProfile()
            .then(() => {
                if (mounted) setState({ loading: false, allowed: true });
            })
            .catch(() => {
                if (mounted) setState({ loading: false, allowed: false });
            });

        return () => {
            mounted = false;
        };
    }, []);

    if (state.loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
                Checking administrator access...
            </div>
        );
    }

    return state.allowed
        ? <Outlet />
        : <Navigate to="/" replace />;
}
