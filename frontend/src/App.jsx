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
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import KanbanBoard from "./pages/KanbanBoard";
import TimeTracking from "./pages/TimeTracking";
import Team from "./pages/Team";
import TaskDetails from "./pages/TaskDetails";


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