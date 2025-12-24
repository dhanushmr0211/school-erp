import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected routes with layout */}
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
            path="/faculty"
            element={
              <ProtectedRoute role="FACULTY">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
  element={
    <ProtectedRoute role="ADMIN">
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  <Route path="/admin" element={<AdminDashboard />} />
</Route>


      </Routes>
    </BrowserRouter>
  );
}
