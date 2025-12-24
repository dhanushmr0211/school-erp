import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/" />;

  const userRole =
    user.app_metadata?.role || user.user_metadata?.role;

  if (role && userRole !== role) return <Navigate to="/" />;

  return children;
}
