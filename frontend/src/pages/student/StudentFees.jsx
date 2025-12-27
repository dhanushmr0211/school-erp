import { useEffect, useState } from "react";
import { fetchStudentFees } from "../../services/studentApi";
import { useAcademicYear } from "../../context/AcademicYearContext";

export default function StudentFees() {
    const { academicYearId } = useAcademicYear();
    const [fees, setFees] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (academicYearId) {
            loadData();
        }
    }, [academicYearId]);

    async function loadData() {
        try {
            const data = await fetchStudentFees(academicYearId);
            setFees(data && data.length > 0 ? data[0] : null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-4">Loading fees...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>My Fees</h1>
            </div>

            <div className="card">
                <h3>Fee Status</h3>
                {fees ? (
                    <div className="flex flex-col gap-md">
                        <div className="flex justify-between border-b p-2">
                            <span>Total Fee Amount:</span>
                            <strong>${fees.total_amount}</strong>
                        </div>
                        <div className="flex justify-between border-b p-2">
                            <span>Paid Amount:</span>
                            <strong>${fees.paid_amount}</strong>
                        </div>
                        <div className="flex justify-between border-b p-2">
                            <span>Due Amount:</span>
                            <strong className="text-red-500">${fees.due_amount}</strong>
                        </div>
                        <div className="mt-md">
                            <span className={`badge ${fees.status === 'PAID' ? 'badge-green' : 'badge-blue'}`}>
                                {fees.status}
                            </span>
                        </div>
                    </div>
                ) : (
                    <p>No fee records found.</p>
                )}
            </div>
        </div>
    );
}
