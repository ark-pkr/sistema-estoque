import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { SystemThemeProvider } from "./context/SystemThemeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <SystemThemeProvider>
        <AppRoutes />
      </SystemThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);