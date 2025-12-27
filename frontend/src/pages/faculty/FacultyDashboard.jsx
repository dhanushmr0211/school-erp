import { useEffect, useState } from "react";
import { fetchFacultyDashboard } from "../../services/facultyApi";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { useNavigate } from "react-router-dom";

export default function FacultyDashboard() {
  const { academicYearId } = useAcademicYear();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (academicYearId) {
      loadData();
    }
  }, [academicYearId]);

  async function loadData() {
    try {
      const data = await fetchFacultyDashboard(academicYearId);
      setClasses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Faculty Dashboard</h1>
      </div>

      <div className="card">
        <h3>My Scheduled Classes</h3>
        {classes.length === 0 ? (
          <p>No classes assigned for this academic year.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Subject</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.class_name} ({c.section})</td>
                  <td>{c.subject_name} ({c.subject_code})</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/faculty/marks?class_id=${c.class_id}&subject_id=${c.subject_id}`)}
                    >
                      Enter Marks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
