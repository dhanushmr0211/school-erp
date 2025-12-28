import { useState, useEffect } from "react";
import { fetchStudentFees, upsertStudentFees } from "../../services/adminStudentApi";

export default function FeesModal({ student, academicYearId, onClose }) {
    const [activeTab, setActiveTab] = useState("1"); // "1" or "2" for Semesters
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // One state object for both semesters to minimize refetching/complexity?
    // Or just fetch all and filter in render?
    // Let's store fees by semester key.
    const [feesMap, setFeesMap] = useState({
        "1": getEmptyFeeState(),
        "2": getEmptyFeeState()
    });

    function getEmptyFeeState() {
        return {
            tuition_total: 0, tuition_paid: 0,
            books_total: 0, books_paid: 0,
            uniform_total: 0, uniform_paid: 0,
            bus_total: 0, bus_paid: 0
        };
    }

    useEffect(() => {
        if (student && academicYearId) {
            loadFees();
        }
    }, [student, academicYearId]);

    async function loadFees() {
        setLoading(true);
        try {
            const data = await fetchStudentFees(student.id, academicYearId);
            // data is Array of records.
            const newMap = { "1": getEmptyFeeState(), "2": getEmptyFeeState() };

            data.forEach(record => {
                const sem = String(record.semester);
                if (newMap[sem]) {
                    newMap[sem] = {
                        tuition_total: record.tuition_total || 0,
                        tuition_paid: record.tuition_paid || 0,
                        books_total: record.books_total || 0,
                        books_paid: record.books_paid || 0,
                        uniform_total: record.uniform_total || 0,
                        uniform_paid: record.uniform_paid || 0,
                        bus_total: record.bus_total || 0,
                        bus_paid: record.bus_paid || 0,
                    };
                }
            });
            setFeesMap(newMap);
        } catch (err) {
            console.error("Failed to load fees", err);
        } finally {
            setLoading(false);
        }
    }

    const currentFee = feesMap[activeTab];

    const handleChange = (field, value) => {
        setFeesMap(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: value
            }
        }));
    };

    const calculateTotal = (f) => (Number(f.tuition_total) || 0) + (Number(f.books_total) || 0) + (Number(f.uniform_total) || 0) + (Number(f.bus_total) || 0);
    const calculatePaid = (f) => (Number(f.tuition_paid) || 0) + (Number(f.books_paid) || 0) + (Number(f.uniform_paid) || 0) + (Number(f.bus_paid) || 0);

    const totalFee = calculateTotal(currentFee);
    const totalPaid = calculatePaid(currentFee);
    const balance = totalFee - totalPaid;

    async function handleSave() {
        setSaving(true);
        try {
            await upsertStudentFees({
                student_id: student.id,
                academic_year_id: academicYearId,
                semester: Number(activeTab),
                ...currentFee
            });
            alert("Fees Saved Successfully!");
        } catch (err) {
            alert("Failed to save fees");
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    if (!student) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100
        }}>
            <div className="card" style={{ width: "600px", maxHeight: "90vh", overflowY: "auto" }}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Fee Management</h2>
                        <p className="text-gray-400 text-sm mt-1">{student.name} ({student.roll_number || "No Roll"})</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                {/* TABS */}
                <div className="flex gap-4 border-b border-gray-700 mb-6">
                    {["1", "2"].map(sem => (
                        <button
                            key={sem}
                            className={`pb-2 px-4 transition-colors font-medium border-b-2 ${activeTab === sem
                                ? "border-accent text-accent"
                                : "border-transparent text-gray-400 hover:text-white"
                                }`}
                            onClick={() => setActiveTab(sem)}
                        >
                            Semester {sem}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p className="text-center py-8 text-gray-500">Loading fees...</p>
                ) : (
                    <div className="grid gap-6">
                        {/* Table Header */}
                        <div className="grid grid-cols-3 gap-4 text-sm font-bold text-gray-400 mb-2 border-b border-gray-800 pb-2">
                            <div>Category</div>
                            <div>Total Fee</div>
                            <div>Paid Amount</div>
                        </div>

                        {/* Fee Rows */}
                        {[
                            { label: "Tuition", key: "tuition" },
                            { label: "Books", key: "books" },
                            { label: "Uniform", key: "uniform" },
                            { label: "Bus/Transport", key: "bus" }
                        ].map(row => (
                            <div key={row.key} className="grid grid-cols-3 gap-4 items-center">
                                <label className="text-sm font-medium">{row.label}</label>
                                <input
                                    type="number"
                                    value={currentFee[`${row.key}_total`]}
                                    onChange={(e) => handleChange(`${row.key}_total`, e.target.value)}
                                    className="bg-gray-900 border border-gray-700 rounded p-2 focus:border-accent outline-none"
                                    placeholder="0"
                                />
                                <input
                                    type="number"
                                    value={currentFee[`${row.key}_paid`]}
                                    onChange={(e) => handleChange(`${row.key}_paid`, e.target.value)}
                                    className="bg-gray-900 border border-gray-700 rounded p-2 focus:border-accent outline-none"
                                    placeholder="0"
                                />
                            </div>
                        ))}

                        {/* Summary */}
                        <div className="mt-6 pt-4 border-t border-gray-700 bg-gray-800/30 p-4 rounded text-sm">
                            <div className="flex justify-between mb-2">
                                <span>Total Fee:</span>
                                <span className="font-bold">{totalFee}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span>Total Paid:</span>
                                <span className="font-bold text-green-400">{totalPaid}</span>
                            </div>
                            <div className="flex justify-between text-lg">
                                <span>Balance:</span>
                                <span className={`font-bold ${balance > 0 ? "text-red-400" : "text-green-400"}`}>
                                    {balance}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button className="btn btn-secondary" onClick={onClose}>Close</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Semester Fees"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
