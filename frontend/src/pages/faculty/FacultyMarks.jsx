import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchClassStudents } from "../../services/adminStudentApi";
import { upsertMarks, fetchMarks, fetchFacultyDashboard } from "../../services/facultyApi";
import { useAcademicYear } from "../../context/AcademicYearContext";

export default function FacultyMarks() {
    const [searchParams] = useSearchParams();
    const classId = searchParams.get("class_id");
    const subjectId = searchParams.get("subject_id");
    const { academicYearId } = useAcademicYear();

    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({}); // { student_id: { test1: val, sem1: val ... } }
    const [activeTab, setActiveTab] = useState("SEM1");
    const [headerInfo, setHeaderInfo] = useState({ className: "", subjectName: "" });
    const [loading, setLoading] = useState(false);

    // Initial Data Load
    useEffect(() => {
        if (classId && academicYearId && subjectId) {
            loadData();
        }
    }, [classId, academicYearId, subjectId]);

    async function loadData() {
        setLoading(true);
        try {
            // 1. Fetch Students
            const studentsData = await fetchClassStudents(classId);
            setStudents(studentsData);

            // 2. Fetch Existing Marks (Full rows)
            const existingMarks = await fetchMarks(classId, subjectId, "ALL", academicYearId);
            const marksMap = {};
            existingMarks.forEach(m => {
                marksMap[m.student_id] = m;
            });
            setMarks(marksMap);

            // 3. Fetch Metadata (Class/Subject Names)
            // Reusing faculty dashboard API which returns flat objects: { class_id, class_name, section, subject_id, subject_name, subject_code }
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

    // Handle Input Change - Update Local State
    const handleChange = (studentId, field, value) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    // Auto-Save Single Row on Blur
    const handleBlur = async (studentId) => {
        const studentMarks = marks[studentId];
        if (!studentMarks) return;

        // Construct payload for this student
        // We send all fields we have for this student to ensure row is complete/updated
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
            console.log("Auto-saving for", studentId);
            await upsertMarks(payload);
        } catch (err) {
            console.error("Auto-save failed", err);
            // Optionally show a toast error here
        }
    };

    const renderInput = (studentId, field, max, step = "1") => {
        const val = marks[studentId]?.[field] ?? "";
        return (
            <input
                type="number"
                min="0"
                max={max}
                step={step}
                value={val}
                onChange={(e) => {
                    // Basic validation
                    const v = e.target.value;
                    if (v === "" || (Number(v) >= 0 && Number(v) <= max)) {
                        handleChange(studentId, field, v);
                    }
                }}
                onBlur={() => handleBlur(studentId)}
                className="bg-gray-900 border border-gray-700 rounded p-1 w-20 text-center focus:border-accent outline-none transition-colors"
                placeholder={`/${max}`}
            />
        );
    };

    if (!classId || !subjectId) return <div className="p-4">Please select a class.</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Marks Entry</h1>
                    {headerInfo.className && (
                        <p className="text-gray-400 mt-1">
                            {headerInfo.className} <span className="mx-2">•</span> {headerInfo.subjectName}
                        </p>
                    )}
                </div>
                <div className="text-sm text-gray-400">
                    Auto-save enabled <span className="text-green-500 ml-1">●</span>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 shadow-2xl border border-gray-700">
                {/* TABS */}
                <div className="flex gap-1 bg-gray-900 p-1 rounded-md mb-6 w-fit border border-gray-700">
                    <button
                        className={`px-6 py-2 rounded-md font-medium transition-all ${activeTab === "SEM1" ? "bg-accent text-white shadow" : "text-gray-400 hover:text-gray-200"
                            }`}
                        onClick={() => setActiveTab("SEM1")}
                    >
                        1st Semester
                    </button>
                    <button
                        className={`px-6 py-2 rounded-md font-medium transition-all ${activeTab === "SEM2" ? "bg-accent text-white shadow" : "text-gray-400 hover:text-gray-200"
                            }`}
                        onClick={() => setActiveTab("SEM2")}
                    >
                        2nd Semester
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500 animate-pulse">Loading class data...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                                    <th className="p-3">Roll No</th>
                                    <th className="p-3">Student Name</th>
                                    {activeTab === "SEM1" ? (
                                        <>
                                            <th className="p-3 text-center">Test 1 (25)</th>
                                            <th className="p-3 text-center">Test 2 (25)</th>
                                            <th className="p-3 text-center">Sem 1 (50)</th>
                                            <th className="p-3 text-center">Sem 1 %</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-3 text-center">Test 1 (25)</th>
                                            <th className="p-3 text-center">Test 2 (25)</th>
                                            <th className="p-3 text-center">Sem 2 (50)</th>
                                            <th className="p-3 text-center">Sem 2 %</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500">
                                            No students found in this class.
                                        </td>
                                    </tr>
                                )}
                                {students.map((s) => (
                                    <tr key={s.student_id} className="hover:bg-gray-750 transition-colors">
                                        <td className="p-3 text-gray-400 font-mono">{s.roll_number || "-"}</td>
                                        <td className="p-3 font-medium text-gray-200">{s.students?.name}</td>

                                        {activeTab === "SEM1" ? (
                                            <>
                                                <td className="p-3 text-center">{renderInput(s.student_id, "test1", 25)}</td>
                                                <td className="p-3 text-center">{renderInput(s.student_id, "test2", 25)}</td>
                                                <td className="p-3 text-center">{renderInput(s.student_id, "sem1", 50)}</td>
                                                <td className="p-3 text-center">
                                                    <input
                                                        type="number"
                                                        value={marks[s.student_id]?.sem1_percentage ?? ""}
                                                        readOnly
                                                        className="bg-gray-800 border border-gray-700 rounded p-1 w-20 text-center text-gray-500 cursor-not-allowed outline-none"
                                                        placeholder="%"
                                                    />
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-3 text-center">{renderInput(s.student_id, "test3", 25)}</td>
                                                <td className="p-3 text-center">{renderInput(s.student_id, "test4", 25)}</td>
                                                <td className="p-3 text-center">{renderInput(s.student_id, "sem2", 50)}</td>
                                                <td className="p-3 text-center">
                                                    <input
                                                        type="number"
                                                        value={marks[s.student_id]?.sem2_percentage ?? ""}
                                                        readOnly
                                                        className="bg-gray-800 border border-gray-700 rounded p-1 w-20 text-center text-gray-500 cursor-not-allowed outline-none"
                                                        placeholder="%"
                                                    />
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
