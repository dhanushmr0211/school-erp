import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStudentMarks, fetchStudentFees, fetchStudentClasses } from "../../services/studentApi";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { BookOpen, GraduationCap, Banknote, Calendar } from "lucide-react";

export default function StudentDashboard() {
  const { academicYearId } = useAcademicYear();

  const isYearLoaded = academicYearId && academicYearId !== "null" && academicYearId !== "undefined";

  // Use individual queries for better flexibility and easier background fetching
  const { data: marks = [], isLoading: marksLoading } = useQuery({
    queryKey: ['studentMarks', academicYearId],
    queryFn: () => fetchStudentMarks(academicYearId),
    enabled: !!isYearLoaded,
  });

  const { data: fees = [], isLoading: feesLoading } = useQuery({
    queryKey: ['studentFees', academicYearId],
    queryFn: () => fetchStudentFees(academicYearId),
    enabled: !!isYearLoaded,
  });

  const { data: classesData = null, isLoading: classesLoading } = useQuery({
    queryKey: ['studentClasses', academicYearId],
    queryFn: () => fetchStudentClasses(academicYearId),
    enabled: !!isYearLoaded,
  });

  const loading = marksLoading || feesLoading || classesLoading;

  // Calculate Fee Summary
  const calculateTotal = (f) => (Number(f.tuition_total) || 0) + (Number(f.books_total) || 0) + (Number(f.uniform_total) || 0) + (Number(f.bus_total) || 0);
  const calculatePaid = (f) => (Number(f.tuition_paid) || 0) + (Number(f.books_paid) || 0) + (Number(f.uniform_paid) || 0) + (Number(f.bus_paid) || 0);

  const totalFee = fees.reduce((acc, f) => acc + calculateTotal(f), 0);
  const totalPaid = fees.reduce((acc, f) => acc + calculatePaid(f), 0);
  const balanceFee = totalFee - totalPaid;

  const [selectedExams, setSelectedExams] = useState({});

  const ALL_EXAMS = ["Test 1", "Test 2", "Semester 1", "Test 3", "Test 4", "Semester 2"];

  const getShortExamName = (fullName) => {
    if (fullName === "Test 1") return "T1";
    if (fullName === "Test 2") return "T2";
    if (fullName === "Test 3") return "T3";
    if (fullName === "Test 4") return "T4";
    if (fullName === "Semester 1") return "Sem 1";
    if (fullName === "Semester 2") return "Sem 2";
    return fullName;
  };

  const getDefaultExam = (subjectExams) => {
    const firstWithMarks = subjectExams.find(m => m.marks_obtained !== null && m.marks_obtained !== undefined);
    return firstWithMarks ? firstWithMarks.exam_type : null;
  };

  const marksBySubject = useMemo(() => {
    const groups = {};
    marks.forEach(m => {
      const subj = m.subject_name || "Unknown";
      if (!groups[subj]) {
        groups[subj] = [];
      }
      groups[subj].push(m);
    });
    return groups;
  }, [marks]);

  if (loading && !classesData) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header mb-8">
        <h1>My Dashboard</h1>
        <p className="text-gray-400">Welcome back, Student!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. MY CLASS */}
        <div className="card col-span-1 md:col-span-2">
          <h3 className="flex items-center gap-2 mb-4 text-accent">
            <Calendar size={20} /> My Class & Subjects
          </h3>
          {classesData && classesData.class_details ? (
            <div>
              <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-gray-400">Class:</span> <strong className="text-xl ml-2">{classesData.class_details.class_name} - {classesData.class_details.section}</strong>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classesData.subjects && classesData.subjects.map((subj, idx) => (
                  <div key={idx} className="p-3 bg-gray-900 rounded border border-gray-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold">{subj.subject_name}</div>
                      <div className="text-xs text-gray-500">{subj.subject_code || "No Code"}</div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-300">
                      {subj.faculty_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">You are not enrolled in any class yet.</p>
          )}
        </div>

        {/* 2. FEES SUMMARY */}
        <div className="card">
          <h3 className="flex items-center gap-2 mb-4 text-accent">
            <Banknote size={20} /> Fee Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-400">Total Due</span>
              <span className="font-bold text-lg">{totalFee}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-400">Paid</span>
              <span className="font-bold text-green-400 text-lg">{totalPaid}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400">Balance</span>
              <span className={`font-bold text-xl ${balanceFee > 0 ? "text-red-400" : "text-green-400"}`}>
                {balanceFee}
              </span>
            </div>
            {balanceFee > 0 && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-300 text-sm text-center">
                Please pay your outstanding fees.
              </div>
            )}
          </div>
        </div>

        {/* 3. RECENT MARKS */}
        <div className="card col-span-1 md:col-span-3">
          <h3 className="flex items-center gap-2 mb-6 text-accent">
            <GraduationCap size={20} /> Recent Exam Results
          </h3>
          {marks.length === 0 ? (
            <p className="text-gray-500 italic">No marks available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(marksBySubject).map((subjectName) => {
                const subjectExams = marksBySubject[subjectName];
                const activeExamType = selectedExams[subjectName] || getDefaultExam(subjectExams) || ALL_EXAMS[0];
                const activeExamData = subjectExams.find(m => m.exam_type === activeExamType);

                return (
                  <div key={subjectName} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between" style={{ background: '#ffffff', border: '1px solid var(--border-soft)' }}>
                    <div>
                      <h4 className="font-bold text-lg mb-4 text-primary flex items-center gap-2">
                        <BookOpen size={18} className="text-accent" /> {subjectName}
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {ALL_EXAMS.map((examType) => {
                          const examData = subjectExams.find(m => m.exam_type === examType);
                          const isSelected = activeExamType === examType;
                          const hasMarks = !!examData;
                          const isPass = hasMarks && Number(examData.percentage) >= 35;

                          let btnStyle = {
                              minWidth: "50px",
                              height: "50px",
                              padding: "4px 8px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              border: "1px solid var(--border-soft)",
                              flex: "1 1 calc(16.66% - 8px)"
                          };

                          if (hasMarks) {
                              if (isPass) {
                                  btnStyle.background = isSelected ? "var(--royal-blue, #1d4ed8)" : "#f0fdf4";
                                  btnStyle.color = isSelected ? "#ffffff" : "#15803d";
                                  btnStyle.borderColor = isSelected ? "var(--royal-blue, #1d4ed8)" : "#bbf7d0";
                              } else {
                                  btnStyle.background = isSelected ? "#dc2626" : "#fef2f2";
                                  btnStyle.color = isSelected ? "#ffffff" : "#b91c1c";
                                  btnStyle.borderColor = isSelected ? "#dc2626" : "#fecaca";
                              }
                          } else {
                              btnStyle.background = isSelected ? "var(--royal-blue, #1d4ed8)" : "#f8fafc";
                              btnStyle.color = isSelected ? "#ffffff" : "#94a3b8";
                              btnStyle.borderColor = "#e2e8f0";
                          }

                          return (
                            <button
                              key={examType}
                              style={btnStyle}
                              onClick={() => setSelectedExams(prev => ({ ...prev, [subjectName]: examType }))}
                            >
                              <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                                {getShortExamName(examType)}
                              </span>
                              <span style={{ fontSize: "0.65rem", marginTop: "2px", opacity: 0.8 }}>
                                {hasMarks ? `${examData.marks_obtained}/${examData.total_marks}` : "-"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{
                      marginTop: "1.25rem",
                      padding: "1rem",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid var(--border-soft)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>{activeExamType}</strong>
                        <div className="text-sm text-secondary mt-1">
                          {activeExamData ? (
                            <>
                              Marks: <strong style={{ color: "var(--text-primary)" }}>{activeExamData.marks_obtained}</strong> / {activeExamData.total_marks} ({activeExamData.percentage}%)
                            </>
                          ) : (
                            "No marks entered for this exam."
                          )}
                        </div>
                      </div>
                      {activeExamData && (
                        <span className={`badge ${Number(activeExamData.percentage) >= 35 ? "badge-green" : "badge-red"}`} style={{ padding: "4px 10px", fontSize: "0.8rem" }}>
                          {Number(activeExamData.percentage) >= 35 ? "PASS" : "FAIL"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
