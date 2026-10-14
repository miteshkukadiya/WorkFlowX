import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './context/AuthContext.jsx'
import { SocketProvider } from "./context/SocketContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { WorkspaceProvider } from "./context/WorkspaceContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> 
    <WorkspaceProvider>
    <SocketProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
    </SocketProvider>
    </WorkspaceProvider>
    </AuthProvider>
  </StrictMode>,
)
