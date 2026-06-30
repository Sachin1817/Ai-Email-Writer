import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#334155",
              borderRadius: "16px",
              boxShadow: "0 10px 30px -5px rgba(0,0,0,0.08)",
              fontSize: "14px",
              fontWeight: 500,
              border: "1px solid #e2e8f0"
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
