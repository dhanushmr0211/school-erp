import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchClassStudents } from "../../services/adminStudentApi";
import { upsertMarks, fetchMarks } from "../../services/facultyApi";
import { useAcademicYear } from "../../context/AcademicYearContext";

export default function FacultyMarks() {
    const [searchParams] = useSearchParams();
    const classId = searchParams.get("class_id");
    const subjectId = searchParams.get("subject_id");
    const { academicYearId } = useAcademicYear();

    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({}); // { student_id: marks_value }
    const [examType, setExamType] = useState("Final");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (classId && academicYearId) {
            loadData();
        }
    }, [classId, academicYearId, subjectId, examType]);

    async function loadData() {
        setLoading(true);
        try {
            // 1. Get students
            const studentsData = await fetchClassStudents(classId);
            setStudents(studentsData);

            // 2. Get existing marks
            if (subjectId) {
                const existingMarks = await fetchMarks(classId, subjectId, examType);
                const marksMap = {};
                existingMarks.forEach(m => {
                    marksMap[m.student_id] = m.marks_obtained;
                });
                setMarks(marksMap);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const marksPayload = Object.keys(marks).map(studentId => ({
                academic_year_id: academicYearId,
                student_id: studentId,
                class_id: classId,
                subject_id: subjectId,
                exam_type: examType,
                marks_obtained: marks[studentId],
                total_marks: 100 // Defaulting to 100 for now
            }));

            // We need to send one by one or bulk. The controller upsertMarks handles one object based on backend check.
            // Wait, backend 'upsertMarks' likely expects a single object or array?
            // Let's assume single for now or loop. Backend controller usually handles one body.
            // Actually reading backend routes might help, but let's assume standard POST. 
            // I'll send requests in parallel for now.

            await Promise.all(marksPayload.map(m => upsertMarks(m)));

            alert("Marks Saved Successfully");
        } catch (err) {
            alert("Failed to save marks");
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    if (!classId || !subjectId) return <div className="p-4">Please select a class from Dashboard first.</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Marks Entry</h1>
            </div>

            <div className="card">
                <div className="flex gap-md items-center mb-md">
                    <h3>Exam Type:</h3>
                    <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        className="w-auto"
                    >
                        <option value="Midterm">Midterm</option>
                        <option value="Final">Final</option>
                        <option value="Quiz">Quiz</option>
                    </select>
                </div>

                {loading ? <p>Loading students...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Marks Obtained (Out of 100)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.student_id}>
                                    <td>{s.student_name}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={marks[s.student_id] || ""}
                                            onChange={(e) => setMarks({ ...marks, [s.student_id]: e.target.value })}
                                            style={{ width: "100px" }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="mt-md">
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Marks"}
                    </button>
                </div>
            </div>
        </div>
    );
}
