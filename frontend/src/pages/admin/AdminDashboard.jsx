import { useEffect, useState } from "react";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { fetchAdminStats } from "../../services/adminApi";

export default function AdminDashboard() {
  const { academicYearId } = useAcademicYear();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!academicYearId) return;

    const loadStats = async () => {
      try {
        const [students, classes, faculties] =
          await fetchAdminStats(academicYearId);

        setStats({
          students: students.length,
          classes: classes.length,
          faculties: faculties.length,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [academicYearId]);

  if (!academicYearId) {
    return <p className="p-6">Select academic year...</p>;
  }

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Students" value={stats.students} />
      <StatCard title="Classes" value={stats.classes} />
      <StatCard title="Faculty" value={stats.faculties} />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded shadow p-6">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
