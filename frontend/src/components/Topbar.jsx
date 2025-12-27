
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useAcademicYear } from "../context/AcademicYearContext";
import { fetchAcademicYears } from "../services/adminApi";
import { LogOut } from "lucide-react";

export default function Topbar() {
  const { user } = useAuth();
  const { academicYearId, setAcademicYearId } = useAcademicYear();
  const [years, setYears] = useState([]);

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

  return (
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
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ padding: "0.5rem" }}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
