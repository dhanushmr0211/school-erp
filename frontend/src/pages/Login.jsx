import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/student/verify`, {
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
      redirectTo: `${window.location.origin}/update-password`,
    });
    setResetLoading(false);
    if (error) alert("Error: " + error.message);
    else {
      alert("Password reset link sent to your email!");
      setShowForgot(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-10%",
        width: "500px",
        height: "500px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%",
        left: "-10%",
        width: "400px",
        height: "400px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite reverse"
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(20px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .login-form {
          animation: scaleIn 0.5s ease-out;
        }
        
        .login-form > * {
          animation: fadeInUp 0.6s ease-out backwards;
        }
        
        .login-form > *:nth-child(1) { animation-delay: 0.1s; }
        .login-form > *:nth-child(2) { animation-delay: 0.2s; }
        .login-form > *:nth-child(3) { animation-delay: 0.3s; }
        .login-form > *:nth-child(4) { animation-delay: 0.4s; }
        .login-form > *:nth-child(5) { animation-delay: 0.5s; }
        .login-form > *:nth-child(6) { animation-delay: 0.6s; }
      `}</style>

      {!showForgot ? (
        <form
          onSubmit={handleLogin}
          className="card login-form"
          style={{
            width: "100%",
            maxWidth: "480px",
            padding: "3rem",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
          }}
        >
          <div className="text-center" style={{ marginBottom: "0.5rem" }}>
            <h1 className="text-3xl font-bold" style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "0.5rem"
            }}>
              {isStudent ? "Student Login" : "Portal Login"}
            </h1>
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
                style={{
                  padding: "0.875rem",
                  fontSize: "1rem",
                  borderRadius: "10px",
                  transition: "all 0.3s ease"
                }}
              />
            </div>
          ) : (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: "0.875rem",
                fontSize: "1rem",
                borderRadius: "10px",
                transition: "all 0.3s ease"
              }}
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
                style={{
                  padding: "0.875rem",
                  fontSize: "1rem",
                  borderRadius: "10px",
                  transition: "all 0.3s ease"
                }}
              />
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: "0.875rem",
                  fontSize: "1rem",
                  borderRadius: "10px",
                  transition: "all 0.3s ease",
                  width: "100%"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)"
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
            style={{
              padding: "0.875rem",
              fontSize: "1.05rem",
              fontWeight: "600",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              transform: loading ? "scale(0.98)" : "scale(1)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p
            className="text-center text-sm text-gray-400 cursor-pointer hover:text-royal-blue"
            onClick={() => setShowForgot(true)}
            style={{ transition: "color 0.3s ease", marginTop: "0" }}
          >
            Forgot Password?
          </p>
        </form>
      ) : (
        <form
          onSubmit={handleReset}
          className="card login-form"
          style={{
            width: "100%",
            maxWidth: "480px",
            padding: "3rem",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
          }}
        >
          <div>
            <h1 className="text-3xl font-bold text-center" style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "0.5rem"
            }}>
              Reset Password
            </h1>
            <p className="text-center text-sm text-gray-400">Enter your email to receive a password reset link.</p>
          </div>

          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
            style={{
              padding: "0.875rem",
              fontSize: "1rem",
              borderRadius: "10px",
              transition: "all 0.3s ease"
            }}
          />

          <button
            type="submit"
            disabled={resetLoading}
            className="btn btn-primary w-full"
            style={{
              padding: "0.875rem",
              fontSize: "1.05rem",
              fontWeight: "600",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              color: "white",
              cursor: resetLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              transform: resetLoading ? "scale(0.98)" : "scale(1)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
            }}
            onMouseEnter={(e) => {
              if (!resetLoading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (!resetLoading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {resetLoading ? "Sending..." : "Send Reset Link"}
          </button>

          <p
            className="text-center text-sm text-gray-400 cursor-pointer hover:text-royal-blue"
            onClick={() => setShowForgot(false)}
            style={{ transition: "color 0.3s ease", marginTop: "0" }}
          >
            Back to Login
          </p>
        </form>
      )}
    </div>
  );
}
