import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const roleParam = searchParams.get("role");
  const isStudent = roleParam === "STUDENT";

  useEffect(() => {
    if (!authLoading && user) {
      const role =
        user.app_metadata?.role ||
        user.user_metadata?.role;

      // If user is already logged in, check if they are trying to access a different role login
      if (roleParam && roleParam !== role) {
        // Mismatch: User is logged in as A (e.g. Student) but wants to login as B (e.g. Faculty)
        // Auto-logout the previous user to allow new login
        supabase.auth.signOut().then(() => {
          // Optional: maybe refresh or verify user is null now
          // For now, React state update in AuthContext should handle it eventually, 
          // but strictly we just want to stay on this page.
        });
        return;
      }

      // If roles match (or no specific role requested), redirect to dashboard
      if (role === "ADMIN") navigate("/admin");
      else if (role === "FACULTY") navigate("/faculty/dashboard");
      else if (role === "STUDENT") navigate("/student/dashboard");
    }
  }, [user, authLoading, navigate, roleParam]);


  /* ... inside Login component ... */
  const [admissionNumber, setAdmissionNumber] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    let loginEmail = email;
    let loginPassword = password;

    if (isStudent) {
      // 1. Verify Student Credentials against Database
      // Note: 'password' state holds the DOB for students
      // 1. Verify Student Credentials against Database
      // Note: 'password' state holds the DOB for students
      try {
        const response = await fetch("http://localhost:5000/student/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admission_number: admissionNumber, dob: password })
        });

        const result = await response.json();

        if (!response.ok) {
          alert(result.error || "Verification failed");
          setLoading(false);
          return;
        }

        loginEmail = result.email;
        console.log("Verified. Login email:", loginEmail);

      } catch (err) {
        console.error("Verification error:", err);
        alert("Server error during verification. Please try again.");
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const role =
      data.user.app_metadata?.role ||
      data.user.user_metadata?.role;

    // ... redirect logic ... 
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
          <div className="text-center mb-md">
            <h1 className="text-xl font-bold">{isStudent ? "Student Login" : "Portal Login"}</h1>
            {isStudent && <p className="text-sm text-gray-400 mt-1">Enter your admission number and date of birth to continue.</p>}
          </div>

          {isStudent ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-semibold ml-1">Admission Number</label>
              <input
                type="number"
                placeholder="Enter Admission Number"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                required
              />
            </div>
          ) : (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          {isStudent ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-semibold ml-1">Date of Birth</label>
              <input
                type="date"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          ) : (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-400 cursor-pointer hover:text-royal-blue mt-4" onClick={() => setShowForgot(true)}>
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

          <p className="text-center text-sm text-gray-400 cursor-pointer hover:text-royal-blue mt-4" onClick={() => setShowForgot(false)}>
            Back to Login
          </p>
        </form>
      )}
    </div>
  );
}
