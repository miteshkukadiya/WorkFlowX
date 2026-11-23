import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import KanbanBoard from "./pages/KanbanBoard";
import TimeTracking from "./pages/TimeTracking";
import Team from "./pages/Team";
import TaskDetails from "./pages/TaskDetails";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CreateWorkspace from "./pages/CreateWorkspace";
import WorkspaceTeam from "./pages/WorkspaceTeam";
import AcceptInvitation from "./pages/AcceptInvitation";
import WorkspaceAuditLogs from "./pages/WorkspaceAuditLogs";
import Billing from "./pages/Billing";
import SprintManagement from "./pages/SprintManagement";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import Planning from "./pages/Planning";


function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/"
                        element={
                            <AppLayout>
                                <Dashboard />
                        </AppLayout>
                    }
                    />

                    <Route
                        path="/projects"
                        element={
                            <AppLayout>
                                <Projects />
                            </AppLayout>
                        }
                    />

                    

                    <Route
                        path="/tasks"
                        element={
                            <AppLayout>
                                <Tasks />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/sprints"
                        element={
                            <AppLayout>
                                <SprintManagement />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/planning"
                        element={
                            <AppLayout>
                                <Planning />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/kanban"
                        element={
                            <AppLayout>
                                <KanbanBoard />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/time-tracking"
                        element={
                            <AppLayout>
                                <TimeTracking />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/team"
                        element={
                            <AppLayout>
                                <Team />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/tasks/:id"
                        element={
                            <AppLayout>
                                <TaskDetails />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/reports"
                        element={
                            <AppLayout>
                                <Reports />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/create-workspace"
                        element={
                            <AppLayout>
                                <CreateWorkspace />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="workspace/team"
                        element={
                            <AppLayout>
                                <WorkspaceTeam />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/invitations/accept"
                        element={
                            <AppLayout>
                                <AcceptInvitation />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="workspace/audit-logs"
                        element={
                            <AppLayout>
                                <WorkspaceAuditLogs />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="workspace/billing"
                        element={
                                <AppLayout>
                                    <Billing />
                                </AppLayout>
                            }
                    />

                    <Route
                        path="/settings"
                        element={
                            <AppLayout>
                                <Settings />
                            </AppLayout>
                        }
                    />

                    <Route element={<AdminRoute />}>
                        <Route
                            path="/admin"
                            element={
                                <AdminLayout>
                                    <AdminDashboard />
                                </AdminLayout>
                            }
                        />
                        <Route
                            path="/admin/organizations"
                            element={
                                <AdminLayout>
                                    <AdminDashboard section="organizations" />
                                </AdminLayout>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <AdminLayout>
                                    <AdminDashboard section="users" />
                                </AdminLayout>
                            }
                        />
                        <Route
                            path="/admin/subscriptions"
                            element={
                                <AdminLayout>
                                    <AdminDashboard section="subscriptions" />
                                </AdminLayout>
                            }
                        />
                        <Route
                            path="/admin/payments"
                            element={
                                <AdminLayout>
                                    <AdminDashboard section="payments" />
                                </AdminLayout>
                            }
                        />
                        <Route
                            path="/admin/audit-logs"
                            element={
                                <AdminLayout>
                                    <AdminDashboard section="audit-logs" />
                                </AdminLayout>
                            }
                        />
                    </Route>


                </Route>

                <Route
                    path="*"
                    element={
                        <Navigate to="/" replace />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;