import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useAcademicYear } from "../context/AcademicYearContext";
import { fetchAcademicYears } from "../services/adminApi";

export default function Topbar() {
  const { user } = useAuth();
  const { academicYear, setAcademicYear } = useAcademicYear();
  const [years, setYears] = useState([]);

  useEffect(() => {
    const loadYears = async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) return;

      const data = await fetchAcademicYears(token);
      setYears(data);

      if (!academicYear && data.length > 0) {
        setAcademicYear(data[0]); // default
      }
    };

    loadYears();
  }, []);

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <h1 className="font-semibold text-lg">Admin Dashboard</h1>

      <div className="flex items-center gap-4">
        <select
          value={academicYear?.id || ""}
          onChange={(e) =>
            setAcademicYear(
              years.find((y) => y.id === e.target.value)
            )
          }
          className="border px-2 py-1 rounded"
        >
          {years.map((year) => (
            <option key={year.id} value={year.id}>
              {year.year_name}
            </option>
          ))}
        </select>

        <span className="text-sm text-gray-600">{user?.email}</span>
      </div>
    </header>
  );
}
