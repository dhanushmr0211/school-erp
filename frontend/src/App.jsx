import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AcademicYearProvider } from "./context/AcademicYearContext";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import FacultyPage from "./pages/admin/FacultyPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AcademicYearProvider>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route element={<DashboardLayout />}>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/faculty"
                element={
                  <ProtectedRoute role="ADMIN">
                    <FacultyPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AcademicYearProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
