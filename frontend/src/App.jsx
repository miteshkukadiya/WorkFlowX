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