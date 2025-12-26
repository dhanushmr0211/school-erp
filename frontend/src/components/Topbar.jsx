import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useAcademicYear } from "../context/AcademicYearContext";
import { fetchAcademicYears } from "../services/adminApi";

export default function Topbar() {
  const { user } = useAuth();
  const { academicYearId, setAcademicYearId } = useAcademicYear();
  const [years, setYears] = useState([]);

  useEffect(() => {
    const loadYears = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      const years = await fetchAcademicYears(token);
      setYears(years);

      // 🔥 SET DEFAULT ACADEMIC YEAR ONCE
      if (!academicYearId && years.length > 0) {
        setAcademicYearId(years[0].id);
      }
    };

    loadYears();
  }, []);

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <h1 className="font-semibold text-lg">Admin Dashboard</h1>

      <div className="flex items-center gap-4">
        <select
          value={academicYearId || ""}
          onChange={(e) => setAcademicYearId(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.year_name}
            </option>
          ))}
        </select>

        <span className="text-sm text-gray-600">{user?.email}</span>
      </div>
    </header>
  );
}
