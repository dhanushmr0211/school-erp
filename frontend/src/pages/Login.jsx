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
    else if (role === "FACULTY") navigate("/faculty");
    else if (role === "STUDENT") navigate("/student");
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
    else if (role === "FACULTY") navigate("/faculty");
    else if (role === "STUDENT") navigate("/student");
    else alert("Role not assigned");

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="border p-6 rounded w-80 space-y-4"
      >
        <h1 className="text-xl font-bold text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white w-full py-2"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
