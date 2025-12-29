import { useState, useEffect } from "react";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { fetchClasses } from "../../services/adminClassApi";
import { apiFetch } from "../../services/apiClient";
import { fetchAcademicYears } from "../../services/adminApi";

export default function PromoteClass() {
    const { academicYearId } = useAcademicYear(); // Source Year (Current Context)
    const [years, setYears] = useState([]);
    const [classes, setClasses] = useState([]);

    const [sourceClassId, setSourceClassId] = useState("");
    const [targetYearId, setTargetYearId] = useState("");
    const [newClassName, setNewClassName] = useState("");
    const [newSection, setNewSection] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, [academicYearId]);

    async function loadInitialData() {
        try {
            const [yearsData, classesData] = await Promise.all([
                fetchAcademicYears(),
                fetchClasses(academicYearId)
            ]);
            setYears(yearsData);
            setClasses(classesData);
        } catch (err) {
            console.error("Failed to load data", err);
        }
    }

    async function handlePromote() {
        if (!sourceClassId || !targetYearId || !newClassName) {
            return alert("Please select Source Class, Target Year, and enter New Class Name");
        }

        if (targetYearId === academicYearId) {
            if (!confirm("Warning: You are promoting to the SAME Academic Year. Are you sure?")) {
                return;
            }
        }

        setLoading(true);
        try {
            await apiFetch('/admin/promote-class', {
                method: 'POST',
                body: {
                    source_class_id: sourceClassId,
                    target_academic_year_id: targetYearId,
                    new_class_name: newClassName,
                    new_section: newSection
                }
            });

            alert("Class Promoted Successfully! New Class Created.");
            // Reset form
            setNewClassName("");
            setNewSection("");
            setSourceClassId("");
        } catch (err) {
            console.error(err);
            alert("Failed to promote class");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1>Promote / Clone Class</h1>
                <p className="text-gray">Move an entire class to a new Academic Year, including students and subjects.</p>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                <div className="mb-md">
                    <label className="block font-bold mb-sm">1. Select Source Class (Current Year)</label>
                    <select
                        value={sourceClassId}
                        onChange={(e) => setSourceClassId(e.target.value)}
                        className="w-full"
                    >
                        <option value="">-- Select Class --</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-md">
                    <label className="block font-bold mb-sm">2. Select Target Academic Year</label>
                    <select
                        value={targetYearId}
                        onChange={(e) => setTargetYearId(e.target.value)}
                        className="w-full"
                    >
                        <option value="">-- Select Year --</option>
                        {years.map(y => (
                            <option key={y.id} value={y.id}>{y.year_name} {y.is_current ? '(Current)' : ''}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-md border-t pt-md mt-md">
                    <label className="block font-bold mb-sm">3. New Class Details</label>
                    <div className="flex gap-md">
                        <div className="flex-1">
                            <label className="text-sm">New Class Name</label>
                            <input
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                placeholder="e.g. Class 2"
                            />
                        </div>
                        <div className="w-1/3">
                            <label className="text-sm">Section</label>
                            <input
                                value={newSection}
                                onChange={(e) => setNewSection(e.target.value)}
                                placeholder="e.g. A"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handlePromote}
                    className="btn btn-primary w-full"
                    disabled={loading}
                >
                    {loading ? "Promoting..." : "Promote & Clone Class"}
                </button>
            </div>
        </div>
    );
}
