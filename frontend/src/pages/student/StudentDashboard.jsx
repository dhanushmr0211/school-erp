import { useEffect, useState } from "react";
import { fetchStudentMarks } from "../../services/studentApi";
import { useAcademicYear } from "../../context/AcademicYearContext";

export default function StudentDashboard() {
  const { academicYearId } = useAcademicYear();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (academicYearId) {
      loadData();
    }
  }, [academicYearId]);

  async function loadData() {
    try {
      const data = await fetchStudentMarks(academicYearId);
      setMarks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>My Dashboard</h1>
      </div>

      <div className="card">
        <h3>My Performance</h3>
        {marks.length === 0 ? (
          <p>No marks records found for this academic year.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam</th>
                <th>Obtained</th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m, idx) => (
                <tr key={idx}>
                  <td>{m.subject_name}</td>
                  <td>{m.exam_type}</td>
                  <td>{m.marks_obtained}</td>
                  <td>{m.total_marks}</td>
                  <td>{((m.marks_obtained / m.total_marks) * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
