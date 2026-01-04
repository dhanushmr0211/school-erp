
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AcademicYearProvider } from "./context/AcademicYearContext";
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import UpdatePassword from "./pages/UpdatePassword";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AcademicYears from "./pages/admin/AcademicYears";
import Subjects from "./pages/admin/Subjects";
import FacultyPage from "./pages/admin/FacultyPage";
import Classes from "./pages/admin/Classes";
import Students from "./pages/admin/Students";
import Reports from "./pages/admin/Reports";
import PromoteClass from "./pages/admin/PromoteClass";

// Faculty Pages
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyMarks from "./pages/faculty/FacultyMarks";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentFees from "./pages/student/StudentFees";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AcademicYearProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/update-password" element={<UpdatePassword />} />

            <Route element={<DashboardLayout />}>

              {/* ADMIN ROUTES */}
              <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/academic-years" element={<ProtectedRoute role="ADMIN"><AcademicYears /></ProtectedRoute>} />
              <Route path="/admin/subjects" element={<ProtectedRoute role="ADMIN"><Subjects /></ProtectedRoute>} />
              <Route path="/admin/faculty" element={<ProtectedRoute role="ADMIN"><FacultyPage /></ProtectedRoute>} />
              <Route path="/admin/classes" element={<ProtectedRoute role="ADMIN"><Classes /></ProtectedRoute>} />
              <Route path="/admin/students" element={<ProtectedRoute role="ADMIN"><Students /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute role="ADMIN"><Reports /></ProtectedRoute>} />
              <Route path="/admin/promote-class" element={<ProtectedRoute role="ADMIN"><PromoteClass /></ProtectedRoute>} />


              {/* FACULTY ROUTES */}
              <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
              <Route path="/faculty/dashboard" element={<ProtectedRoute role="FACULTY"><FacultyDashboard /></ProtectedRoute>} />
              <Route path="/faculty/marks" element={<ProtectedRoute role="FACULTY"><FacultyMarks /></ProtectedRoute>} />

              {/* STUDENT ROUTES */}
              <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
              <Route path="/student/dashboard" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/fees" element={<ProtectedRoute role="STUDENT"><StudentFees /></ProtectedRoute>} />

            </Route>

            {/* Catch all redirect - redirecting to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </AcademicYearProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
