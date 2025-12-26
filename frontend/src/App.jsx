import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import FacultyPage from "./pages/admin/FacultyPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AcademicYearProvider } from "./context/AcademicYearContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AcademicYearProvider>
          <Routes>

            {/* Public */}
            <Route path="/" element={<Login />} />

            {/* Protected Layout */}
            <Route element={<DashboardLayout />}>

              {/* ADMIN */}
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

              {/* FACULTY */}
              <Route
                path="/faculty"
                element={
                  <ProtectedRoute role="FACULTY">
                    <FacultyDashboard />
                  </ProtectedRoute>
                }
              />

              {/* STUDENT */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute role="STUDENT">
                    <StudentDashboard />
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
