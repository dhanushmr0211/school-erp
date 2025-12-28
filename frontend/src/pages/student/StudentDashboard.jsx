import { useEffect, useState } from "react";
import { fetchStudentMarks, fetchStudentFees, fetchStudentClasses } from "../../services/studentApi";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { BookOpen, GraduationCap, Banknote, Calendar } from "lucide-react";

export default function StudentDashboard() {
  const { academicYearId } = useAcademicYear();
  const [marks, setMarks] = useState([]);
  const [fees, setFees] = useState([]);
  const [classesData, setClassesData] = useState(null); // { class_details, subjects }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (academicYearId) {
      loadData();
    }
  }, [academicYearId]);

  async function loadData() {
    setLoading(true);
    try {
      const [marksData, feesData, classData] = await Promise.all([
        fetchStudentMarks(academicYearId),
        fetchStudentFees(academicYearId),
        fetchStudentClasses(academicYearId)
      ]);
      setMarks(marksData || []);
      setFees(feesData || []);
      setClassesData(classData || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate Fee Summary
  const totalFee = fees.reduce((acc, f) => acc + (Number(f.total_fee) || 0), 0);
  const totalPaid = fees.reduce((acc, f) => acc + (Number(f.total_paid) || 0), 0);
  const balanceFee = totalFee - totalPaid;

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

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
          <h3 className="flex items-center gap-2 mb-4 text-accent">
            <GraduationCap size={20} /> Recent Exam Results
          </h3>
          {marks.length === 0 ? (
            <p className="text-gray-500 italic">No marks available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-sm">
                    <th className="p-3">Exam</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3 text-right">Marks</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-right">Percent</th>
                    <th className="p-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m, idx) => {
                    const isFail = Number(m.percentage) < 35; // Example passing criteria
                    return (
                      <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="p-3 font-medium text-white">{m.exam_type}</td>
                        <td className="p-3 text-gray-300">{m.subject_name}</td>
                        <td className="p-3 text-right font-bold">{m.marks_obtained}</td>
                        <td className="p-3 text-right text-gray-500">{m.total_marks}</td>
                        <td className="p-3 text-right">{m.percentage}%</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${isFail ? "bg-red-900/50 text-red-400" : "bg-green-900/50 text-green-400"}`}>
                            {isFail ? "FAIL" : "PASS"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
