import { useEffect, useState } from "react";
import { fetchAdminStats } from "../../services/adminApi";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { Users, Layers, BookOpen } from "lucide-react";

export default function AdminDashboard() {
  const { academicYearId } = useAcademicYear();
  const [stats, setStats] = useState({ students: 0, classes: 0, faculty: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (academicYearId) {
      loadStats();
    }
  }, [academicYearId]);

  async function loadStats() {
    try {
      // fetchAdminStats returns [students, classes, faculty] arrays
      const [students, classes, faculty] = await fetchAdminStats(academicYearId);
      setStats({
        students: students.length,
        classes: classes.length,
        faculty: faculty.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Loading stats...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <span className="badge badge-blue">Academic Year Active</span>
      </div>

      <div className="flex gap-md flex-wrap">
        <div className="card flex-1 flex flex-col items-center justify-center p-8">
          <Users size={48} className="text-blue-500 mb-md" />
          <h2 className="text-4xl font-bold">{stats.students}</h2>
          <p className="text-gray-400">Total Students</p>
        </div>

        <div className="card flex-1 flex flex-col items-center justify-center p-8">
          <Layers size={48} className="text-green-500 mb-md" />
          <h2 className="text-4xl font-bold">{stats.classes}</h2>
          <p className="text-gray-400">Total Classes</p>
        </div>

        <div className="card flex-1 flex flex-col items-center justify-center p-8">
          <BookOpen size={48} className="text-purple-500 mb-md" />
          <h2 className="text-4xl font-bold">{stats.faculty}</h2>
          <p className="text-gray-400">Total Faculty</p>
        </div>
      </div>

      <div className="card mt-md">
        <h3>Quick Actions</h3>
        <div className="flex gap-md">
          <a href="/admin/students" className="btn btn-secondary">Manage Students</a>
          <a href="/admin/classes" className="btn btn-secondary">Manage Classes</a>
          <a href="/admin/reports" className="btn btn-secondary">Generate Reports</a>
        </div>
      </div>
    </div>
  );
}
