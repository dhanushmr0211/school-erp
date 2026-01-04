import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchClassStudents } from "../../services/adminStudentApi";
import { upsertMarks, fetchMarks, fetchFacultyDashboard } from "../../services/facultyApi";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { CheckCircle } from "lucide-react";

export default function FacultyMarks() {
    const [searchParams] = useSearchParams();
    const classId = searchParams.get("class_id");
    const subjectId = searchParams.get("subject_id");
    const { academicYearId } = useAcademicYear();

    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({});
    const [activeTab, setActiveTab] = useState("SEM1");
    const [headerInfo, setHeaderInfo] = useState({ className: "", subjectName: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (classId && academicYearId && subjectId) {
            loadData();
        }
    }, [classId, academicYearId, subjectId]);

    async function loadData() {
        setLoading(true);
        try {
            const studentsData = await fetchClassStudents(classId);
            setStudents(studentsData);

            const existingMarks = await fetchMarks(classId, subjectId, "ALL", academicYearId);
            const marksMap = {};
            existingMarks.forEach(m => {
                marksMap[m.student_id] = m;
            });
            setMarks(marksMap);

            const dashboardData = await fetchFacultyDashboard(academicYearId);
            const match = dashboardData.find(d => d.class_id === classId && d.subject_id === subjectId);
            if (match) {
                setHeaderInfo({
                    className: `${match.class_name} (${match.section})`,
                    subjectName: `${match.subject_name} (${match.subject_code})`
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (studentId, field, value) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleBlur = async (studentId) => {
        const studentMarks = marks[studentId];
        if (!studentMarks) return;

        const payload = {
            class_id: classId,
            subject_id: subjectId,
            academic_year_id: academicYearId,
            marks: [{
                student_id: studentId,
                ...studentMarks
            }]
        };

        try {
            await upsertMarks(payload);
        } catch (err) {
            console.error("Auto-save failed", err);
        }
    };

    const renderInput = (studentId, field, max) => {
        const val = marks[studentId]?.[field] ?? "";
        return (
            <input
                type="number"
                min="0"
                max={max}
                value={val}
                onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || (Number(v) >= 0 && Number(v) <= max)) {
                        handleChange(studentId, field, v);
                    }
                }}
                onBlur={() => handleBlur(studentId)}
                className="text-center font-bold text-royal transition-colors focus:bg-blue-50"
                style={{
                    width: "60px",
                    padding: "0.5rem 0",
                    margin: "0 auto",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "6px"
                }}
                placeholder={`/${max}`}
            />
        );
    };

    if (!classId || !subjectId) return <div className="p-4">Please select a class.</div>;

    const TabButton = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                flex: 1,
                padding: "0.5rem 1.5rem",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: 600,
                transition: "all 0.2s",
                background: activeTab === id ? "white" : "transparent",
                color: activeTab === id ? "var(--royal-blue)" : "var(--text-secondary)",
                boxShadow: activeTab === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                border: "none",
                cursor: "pointer"
            }}
        >
            {label}
        </button>
    );

    return (
        <div className="animate-fade-in" style={{ paddingBottom: "2rem" }}>
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 style={{ marginBottom: "0.5rem" }}>Marks Entry</h1>
                    {headerInfo.className && (
                        <p className="text-secondary" style={{ fontSize: "1.1rem" }}>
                            {headerInfo.className} <span className="mx-2 text-gold">•</span> {headerInfo.subjectName}
                        </p>
                    )}
                </div>
                <div className="text-sm text-muted flex items-center gap-sm" style={{ padding: "0.5rem 1rem", background: "white", borderRadius: "99px", border: "1px solid var(--border-soft)" }}>
                    Auto-save enabled <CheckCircle size={16} className="text-green-500" />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Segmented Control Tabs */}
                <div style={{ padding: "1.5rem", background: "#f8fafc", borderBottom: "1px solid var(--border-soft)" }}>
                    <div style={{
                        display: "inline-flex",
                        background: "#e2e8f0",
                        padding: "4px",
                        borderRadius: "8px",
                        gap: "4px"
                    }}>
                        <TabButton id="SEM1" label="1st Semester" />
                        <TabButton id="SEM2" label="2nd Semester" />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted">Loading class data...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table style={{ minWidth: "100%", width: "100%", borderSpacing: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '2rem', width: "10%" }}>Roll No</th>
                                    <th style={{ width: "25%" }}>Student Name</th>
                                    {activeTab === "SEM1" ? (
                                        <>
                                            <th className="text-center" style={{ width: "15%" }}>Test 1 (25)</th>
                                            <th className="text-center" style={{ width: "15%" }}>Test 2 (25)</th>
                                            <th className="text-center" style={{ width: "15%" }}>Sem 1 (50)</th>
                                            <th className="text-center" style={{ paddingRight: '2rem', width: "20%" }}>Sem 1 %</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="text-center" style={{ width: "15%" }}>Test 3 (25)</th>
                                            <th className="text-center" style={{ width: "15%" }}>Test 4 (25)</th>
                                            <th className="text-center" style={{ width: "15%" }}>Sem 2 (50)</th>
                                            <th className="text-center" style={{ paddingRight: '2rem', width: "20%" }}>Sem 2 %</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-muted">
                                            No students found in this class.
                                        </td>
                                    </tr>
                                )}
                                {students.map((s) => (
                                    <tr key={s.student_id}>
                                        <td className="font-mono text-royal" style={{ paddingLeft: '2rem', fontWeight: 600 }}>
                                            {s.roll_number || "-"}
                                        </td>
                                        <td className="font-medium text-primary">
                                            {s.students?.name}
                                        </td>

                                        {activeTab === "SEM1" ? (
                                            <>
                                                <td className="text-center">{renderInput(s.student_id, "test1", 25)}</td>
                                                <td className="text-center">{renderInput(s.student_id, "test2", 25)}</td>
                                                <td className="text-center">{renderInput(s.student_id, "sem1", 50)}</td>
                                                <td className="text-center" style={{ paddingRight: '2rem' }}>
                                                    <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>
                                                        {marks[s.student_id]?.sem1_percentage ? `${marks[s.student_id]?.sem1_percentage}%` : "-"}
                                                    </span>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="text-center">{renderInput(s.student_id, "test3", 25)}</td>
                                                <td className="text-center">{renderInput(s.student_id, "test4", 25)}</td>
                                                <td className="text-center">{renderInput(s.student_id, "sem2", 50)}</td>
                                                <td className="text-center" style={{ paddingRight: '2rem' }}>
                                                    <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>
                                                        {marks[s.student_id]?.sem2_percentage ? `${marks[s.student_id]?.sem2_percentage}%` : "-"}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
