import { useEffect, useState } from "react";
import { fetchAcademicYears, createAcademicYear } from "../../services/adminApi";

export default function AcademicYears() {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
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
                        {years.map((y) => (
                            <tr key={y.id}>
                                <td>{y.year_name}</td>
                                <td>{y.start_date}</td>
                                <td>{y.end_date}</td>
                                <td>
                                    <span className={`badge ${y.is_current ? "badge-green" : "badge-blue"}`}>
                                        {y.is_current ? "Current" : "Historical"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
