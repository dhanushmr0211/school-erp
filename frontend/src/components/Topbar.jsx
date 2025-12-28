

import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useAcademicYear } from "../context/AcademicYearContext";
import { fetchAcademicYears } from "../services/adminApi";
import { LogOut, KeyRound, X } from "lucide-react";

export default function Topbar() {
  const { user } = useAuth();
  const { academicYearId, setAcademicYearId } = useAcademicYear();
  const [years, setYears] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const yearsData = await fetchAcademicYears();
        setYears(yearsData || []);
        if (!academicYearId && yearsData.length > 0) {
          setAcademicYearId(yearsData[0].id);
        }
      } catch (err) {
        console.error("Failed to load academic years", err);
      }
    };
    loadYears();
  }, [academicYearId, setAcademicYearId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return alert("Password must be at least 6 characters");
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) alert("Error: " + error.message);
    else {
      alert("Password updated successfully!");
      setShowPasswordModal(false);
      setNewPassword("");
    }
  };

  return (
    <>
      <header className="page-header" style={{ marginBottom: 0, padding: "var(--spacing-lg)", borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
        <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
          Welcome, {user?.email?.split('@')[0]}
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
            <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Year:</label>
            <select
              value={academicYearId || ""}
              onChange={(e) => setAcademicYearId(e.target.value)}
              style={{ width: "auto", padding: "0.5rem" }}
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.year_name} ({y.start_date} - {y.end_date})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-secondary"
            style={{ padding: "0.5rem" }}
            title="Change Password"
          >
            <KeyRound size={18} />
          </button>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: "0.5rem" }}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {showPasswordModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div className="card" style={{ width: "400px", position: "relative" }}>
            <button
              onClick={() => setShowPasswordModal(false)}
              style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="input-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
