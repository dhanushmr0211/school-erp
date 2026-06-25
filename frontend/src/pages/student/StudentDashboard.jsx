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

  const [activeExam, setActiveExam] = useState(null);

  const ALL_EXAMS = ["Test 1", "Test 2", "Semester 1", "Test 3", "Test 4", "Semester 2"];

  // Filter exams that have marks entered
  const examsWithMarks = useMemo(() => {
    return ALL_EXAMS.filter(examType => 
      marks.some(m => m.exam_type === examType)
    );
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
          {examsWithMarks.length === 0 ? (
            <p className="text-gray-500 italic">No marks available.</p>
          ) : (
            <div>
              {/* Exam Selection Cards */}
              <div className="flex gap-4 flex-wrap mb-6">
                {examsWithMarks.map((examType) => {
                  const examMarks = marks.filter(m => m.exam_type === examType);
                  const totalObtained = examMarks.reduce((sum, m) => sum + (Number(m.marks_obtained) || 0), 0);
                  const totalMax = examMarks.reduce((sum, m) => sum + (Number(m.total_marks) || 0), 0);
                  const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
                  const anySubjectFailed = examMarks.some(m => Number(m.percentage) < 35);
                  
                  const isSelected = (activeExam || examsWithMarks[0]) === examType;
                  
                  let cardStyle = {
                    flex: "1 1 180px",
                    minWidth: "180px",
                    padding: "1.25rem",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: "2px solid transparent",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  };
                  
                  if (anySubjectFailed) {
                    cardStyle.background = isSelected ? "#fee2e2" : "#fef2f2";
                    cardStyle.borderColor = isSelected ? "#dc2626" : "transparent";
                    cardStyle.color = "#991b1b";
                  } else {
                    cardStyle.background = isSelected ? "#dcfce7" : "#f0fdf4";
                    cardStyle.borderColor = isSelected ? "#15803d" : "transparent";
                    cardStyle.color = "#14532d";
                  }
                  
                  return (
                    <button
                      key={examType}
                      style={cardStyle}
                      onClick={() => setActiveExam(examType)}
                    >
                      <div>
                        <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.8, marginBottom: "4px" }}>
                          Exam Type
                        </div>
                        <strong style={{ fontSize: "1.1rem", display: "block", marginBottom: "8px" }}>
                          {examType}
                        </strong>
                      </div>
                      <div>
                        <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                          {totalObtained} / {totalMax}
                        </div>
                        <div style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: "2px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>Percentage: {overallPct}%</span>
                          <span className={`badge ${anySubjectFailed ? "badge-red" : "badge-green"}`} style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                            {anySubjectFailed ? "FAIL" : "PASS"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Exam Marks Details */}
              {(() => {
                const selectedExam = activeExam || examsWithMarks[0];
                const selectedExamMarks = marks.filter(m => m.exam_type === selectedExam);
                const selectedGrandObtained = selectedExamMarks.reduce((sum, m) => sum + (Number(m.marks_obtained) || 0), 0);
                const selectedGrandMax = selectedExamMarks.reduce((sum, m) => sum + (Number(m.total_marks) || 0), 0);
                const selectedGrandPercentage = selectedGrandMax > 0 ? Math.round((selectedGrandObtained / selectedGrandMax) * 100) : 0;
                const selectedAnyFailed = selectedExamMarks.some(m => Number(m.percentage) < 35);

                return (
                  <div className="p-6 bg-white rounded-xl shadow-sm mt-6" style={{ background: '#ffffff', border: '1px solid var(--border-soft)' }}>
                    <h4 className="font-bold text-lg mb-4 text-primary flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-soft)", paddingBottom: "10px" }}>
                      <BookOpen size={18} className="text-accent" /> {selectedExam} Marksheet
                    </h4>
                    
                    <div style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>
                      <table style={{ minWidth: "500px", width: "100%", borderSpacing: 0 }}>
                        <thead>
                          <tr style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            <th style={{ textAlign: "left", padding: "10px 0" }}>Subject</th>
                            <th style={{ textAlign: "right", padding: "10px 0" }}>Marks Obtained</th>
                            <th style={{ textAlign: "right", padding: "10px 0" }}>Total Marks</th>
                            <th style={{ textAlign: "right", padding: "10px 0" }}>Percentage</th>
                            <th style={{ textAlign: "center", padding: "10px 0" }}>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedExamMarks.map((m, idx) => {
                            const isFail = Number(m.percentage) < 35;
                            const rowColor = isFail ? "#dc2626" : "var(--text-primary)";
                            return (
                              <tr key={idx} style={{ color: rowColor, borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "12px 0", fontWeight: 500 }}>{m.subject_name}</td>
                                <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 700 }}>{m.marks_obtained}</td>
                                <td style={{ padding: "12px 0", textAlign: "right", opacity: 0.8 }}>{m.total_marks}</td>
                                <td style={{ padding: "12px 0", textAlign: "right" }}>{m.percentage}%</td>
                                <td style={{ padding: "12px 0", textAlign: "center" }}>
                                  <span className={`badge ${isFail ? "badge-red" : "badge-green"}`} style={{ padding: "2px 8px", fontSize: "0.75rem" }}>
                                    {isFail ? "FAIL" : "PASS"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          
                          {/* Grand summary row */}
                          <tr style={{ fontWeight: "bold", background: "#f8fafc" }}>
                            <td style={{ padding: "12px 10px", borderRadius: "8px 0 0 8px" }}>Grand Total</td>
                            <td style={{ padding: "12px 10px", textAlign: "right" }}>{selectedGrandObtained}</td>
                            <td style={{ padding: "12px 10px", textAlign: "right" }}>{selectedGrandMax}</td>
                            <td style={{ padding: "12px 10px", textAlign: "right" }}>{selectedGrandPercentage}%</td>
                            <td style={{ padding: "12px 10px", textAlign: "center", borderRadius: "0 8px 8px 0" }}>
                              <span className={`badge ${selectedAnyFailed ? "badge-red" : "badge-green"}`} style={{ padding: "4px 10px", fontSize: "0.8rem" }}>
                                {selectedAnyFailed ? "FAIL" : "PASS"}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
