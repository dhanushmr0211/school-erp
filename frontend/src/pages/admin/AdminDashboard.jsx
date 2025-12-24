import { useEffect, useState } from "react";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { fetchAdminStats } from "../../services/adminApi";

export default function AdminDashboard() {
  const { academicYear } = useAcademicYear();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!academicYear) return;

    const loadStats = async () => {
      const [students, classes, faculties] =
        await fetchAdminStats(academicYear.id);

      setStats({
        students: students.length,
        classes: classes.length,
        faculties: faculties.length,
      });
    };

    loadStats();
  }, [academicYear]);

  if (!stats) {
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
