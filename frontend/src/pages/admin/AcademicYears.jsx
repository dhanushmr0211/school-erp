import { useEffect, useState } from "react";
import { fetchAcademicYears, createAcademicYear, activateAcademicYear, syncAcademicYearData } from "../../services/adminApi";

export default function AcademicYears() {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncedYears, setSyncedYears] = useState(new Set()); // Track synced years in this session
    const [form, setForm] = useState({ year_name: "", start_date: "", end_date: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const data = await fetchAcademicYears();
            setYears(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createAcademicYear(form);
            setForm({ year_name: "", start_date: "", end_date: "" });
            loadData();
        } catch (err) {
            alert("Failed to create academic year");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleSetActive(id) {
        if (!confirm("Are you sure you want to set this as the active year? This will deactivate all other years.")) return;
        try {
            await activateAcademicYear(id);
            loadData();
        } catch (err) {
            alert("Failed to activate academic year");
        }
    }

    async function handleSync(fromYearId, toYearId, fromYearName, toYearName) {
        const warningMessage = `⚠️ PROFESSIONAL WARNING: SYNC IN PROGRESS\n\nYou are about to copy all Subjects, Faculty, and Student master records from academic year ${fromYearName} into ${toYearName}.\n\n- Existing records in ${toYearName} will NOT be deleted or overwritten.\n- This action is permanent and helpful for setting up new years quickly.\n\nAre you sure you want to proceed with this data migration?`;

        if (!confirm(warningMessage)) return;

        try {
            await syncAcademicYearData(fromYearId, toYearId);
            alert(`✅ SUCCESS: Data from ${fromYearName} has been successfully migrated to ${toYearName}.`);
            setSyncedYears(prev => new Set([...prev, toYearId])); // Hide button for this session
            loadData();
        } catch (err) {
            alert("❌ ERROR: Data synchronization failed. Please check your network or contact support.");
        }
    }

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Academic Years</h1>
            </div>

            <div className="card">
                <h3>Create New Academic Year</h3>
                <form onSubmit={handleSubmit} className="flex gap-md items-end flex-wrap">
                    <div className="input-group flex-1">
                        <label>Year Name (e.g. 2024-2025)</label>
                        <input
                            value={form.year_name}
                            onChange={(e) => setForm({ ...form, year_name: e.target.value })}
                            placeholder="2024-2025"
                            required
                        />
                    </div>
                    <div className="input-group flex-1">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={form.start_date}
                            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group flex-1">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={form.end_date}
                            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Year"}
                    </button>
                </form>
            </div>

            <div className="card">
                <h3>Existing Years</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Year Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {years.map((y) => {
                            const activeYear = years.find(yr => yr.is_active);
                            return (
                                <tr key={y.id}>
                                    <td>{y.year_name}</td>
                                    <td>{y.start_date}</td>
                                    <td>{y.end_date}</td>
                                    <td>
                                        <div className="flex items-center gap-md">
                                            <span className={`badge ${y.is_active ? "badge-green" : "badge-blue"}`}>
                                                {y.is_active ? "Active" : "Historical"}
                                            </span>
                                            <div className="flex gap-sm">
                                                {!y.is_active && (
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleSetActive(y.id)}
                                                    >
                                                        Set Active
                                                    </button>
                                                )}
                                                {!y.is_active && activeYear && y.year_name > activeYear.year_name && !syncedYears.has(y.id) && (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        style={{ background: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        onClick={() => handleSync(activeYear.id, y.id, activeYear.year_name, y.year_name)}
                                                    >
                                                        <span>🔄</span> Sync Data from {activeYear.year_name}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
