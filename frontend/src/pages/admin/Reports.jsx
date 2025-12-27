import { useState } from "react";
import { getReportCard } from "../../services/reportsApi";
import { useAcademicYear } from "../../context/AcademicYearContext"; // Fixed import

export default function Reports() {
    const { academicYearId } = useAcademicYear();
    const [studentId, setStudentId] = useState("");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleGenerate() {
        if (!studentId || !academicYearId) return alert("Enter Student ID and select Academic Year");
        setLoading(true);
        try {
            const data = await getReportCard(studentId, academicYearId);
            setReportData(data);
        } catch (err) {
            alert("Failed to fetch report");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1>Reports</h1>
            </div>

            <div className="card">
                <h3>Generate Student Report Card</h3>
                <div className="flex gap-md items-end">
                    <div className="input-group flex-1">
                        <label>Student ID (UUID)</label>
                        <input
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="e.g. 123e4567-e89b..."
                            required
                        />
                    </div>
                    <button onClick={handleGenerate} className="btn btn-primary mb-md" disabled={loading}>
                        {loading ? "Generating..." : "Generate"}
                    </button>
                </div>
            </div>

            {reportData && (
                <div className="card">
                    <h3>Report Card</h3>
                    <p><strong>Student:</strong> {reportData.studentName}</p>
                    <p><strong>Class:</strong> {reportData.className}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Marks Obtained</th>
                                <th>Total Marks</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.subjects?.map((s, idx) => (
                                <tr key={idx}>
                                    <td>{s.subject}</td>
                                    <td>{s.obtained}</td>
                                    <td>{s.total}</td>
                                    <td>{s.grade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
