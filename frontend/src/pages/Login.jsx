import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      const role =
        user.app_metadata?.role ||
        user.user_metadata?.role;


      if (role === "ADMIN") navigate("/admin");
      else if (role === "FACULTY") navigate("/faculty/dashboard");
      else if (role === "STUDENT") navigate("/student/dashboard");
    }
  }, [user, authLoading, navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const role =
      data.user.app_metadata?.role ||
      data.user.user_metadata?.role;

    if (role === "ADMIN") navigate("/admin");
    else if (role === "FACULTY") navigate("/faculty/dashboard");
    else if (role === "STUDENT") navigate("/student/dashboard");
    else alert("Role not assigned");

    setLoading(false);
  };


  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: "http://localhost:5173/update-password", // You'd need a route for this ideally
    });
    setResetLoading(false);
    if (error) alert("Error: " + error.message);
    else {
      alert("Password reset link sent to your email!");
      setShowForgot(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {!showForgot ? (
        <form
          onSubmit={handleLogin}
          className="card w-96 space-y-4"
        >
          <h1 className="text-xl font-bold text-center mb-md">Login</h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-400 cursor-pointer hover:text-white mt-4" onClick={() => setShowForgot(true)}>
            Forgot Password?
          </p>
        </form>
      ) : (
        <form
          onSubmit={handleReset}
          className="card w-96 space-y-4"
        >
          <h1 className="text-xl font-bold text-center mb-md">Reset Password</h1>
          <p className="text-center text-sm text-gray-400 mb-4">Enter your email to receive a password reset link.</p>

          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={resetLoading}
            className="btn btn-primary w-full"
          >
            {resetLoading ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="text-center text-sm text-gray-400 cursor-pointer hover:text-white mt-4" onClick={() => setShowForgot(false)}>
            Back to Login
          </p>
        </form>
      )}
    </div>
  );
}
