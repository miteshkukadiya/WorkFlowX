import { useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = ({
    children
}) => {

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    return (
        <div className="flex min-h-screen min-w-0 overflow-x-hidden bg-slate-50">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">

                <Topbar
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">

                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>

                </main>

            </div>

        </div>
    );
};

export default AppLayout;