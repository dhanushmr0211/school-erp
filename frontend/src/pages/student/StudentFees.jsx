import { useEffect, useState } from "react";
import { fetchStudentFees } from "../../services/studentApi";
import { useAcademicYear } from "../../context/AcademicYearContext";

export default function StudentFees() {
    const { academicYearId } = useAcademicYear();
    const [feeRecords, setFeeRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (academicYearId) {
            loadData();
        }
    }, [academicYearId]);

    async function loadData() {
        try {
            const data = await fetchStudentFees(academicYearId);
            // Expecting array of records (per semester)
            setFeeRecords(data || []);
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

            <div className="flex flex-col gap-md">
                {feeRecords.length > 0 ? (
                    feeRecords.map((fee, index) => <FeeCard key={index} fee={fee} />)
                ) : (
                    <div className="card">
                        <p className="text-gray-500">No fee records found for this academic year.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FeeCard({ fee }) {
    const [expanded, setExpanded] = useState(false);

    const calculateTotal = (f) => (Number(f.tuition_total) || 0) + (Number(f.books_total) || 0) + (Number(f.uniform_total) || 0) + (Number(f.bus_total) || 0);
    const calculatePaid = (f) => (Number(f.tuition_paid) || 0) + (Number(f.books_paid) || 0) + (Number(f.uniform_paid) || 0) + (Number(f.bus_paid) || 0);

    const totalFee = calculateTotal(fee);
    const totalPaid = calculatePaid(fee);
    const balance = totalFee - totalPaid;

    const status = balance <= 0 ? "PAID" : (totalPaid > 0 ? "PARTIAL" : "UNPAID");
    const statusColor = balance <= 0 ? "badge-green" : (totalPaid > 0 ? "badge-blue" : "badge-red");

    return (
        <div className="card">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div>
                    <h3 className="m-0">Semester {fee.semester}</h3>
                    <p className="text-gray-400 text-sm mt-1">Total: ${totalFee} | Paid: ${totalPaid}</p>
                </div>
                <div className="flex items-center gap-md">
                    <span className={`badge ${statusColor}`}>{status}</span>
                    <span className="text-xl font-bold">{expanded ? "-" : "+"}</span>
                </div>
            </div>

            {expanded && (
                <div className="mt-md pt-md border-t border-gray-700 grid gap-md">
                    <FeeRow label="Tuition" total={fee.tuition_total} paid={fee.tuition_paid} />
                    <FeeRow label="Books" total={fee.books_total} paid={fee.books_paid} />
                    <FeeRow label="Uniform" total={fee.uniform_total} paid={fee.uniform_paid} />
                    <FeeRow label="Bus/Transport" total={fee.bus_total} paid={fee.bus_paid} />

                    <div className="mt-md pt-md border-t border-gray-800 flex justify-between items-center">
                        <span className="font-bold">Balance Due:</span>
                        <span className={`text-xl font-bold ${balance > 0 ? "text-red-400" : "text-green-400"}`}>
                            ${balance}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function FeeRow({ label, total, paid }) {
    const t = Number(total) || 0;
    const p = Number(paid) || 0;
    const due = t - p;

    // Only show row if there is a total fee set
    if (t === 0 && p === 0) return null;

    return (
        <div className="grid grid-cols-3 gap-sm text-sm">
            <div className="font-medium text-gray-300">{label}</div>
            <div className="text-right">Fee: {t}</div>
            <div className="text-right">
                <span className="text-green-400">Paid: {p}</span>
                {due > 0 && <span className="text-red-400 ml-2">(Due: {due})</span>}
            </div>
        </div>
    );
}
