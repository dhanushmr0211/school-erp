import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { AcademicYearProvider } from "./context/AcademicYearContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
     <AcademicYearProvider>
    <App />
  </AcademicYearProvider>
    </AuthProvider>
  </React.StrictMode>
);
