import { useEffect, useState } from "react";
import { fetchSubjects, createSubject } from "../../services/adminSubjectApi";

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: "", code: "", type: "THEORY" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const data = await fetchSubjects();
            setSubjects(data);
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
            await createSubject(form);
            setForm({ name: "", code: "", type: "THEORY" });
            loadData();
        } catch (err) {
            alert("Failed to create subject");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Subjects Management</h1>
            </div>

            <div className="card">
                <h3>Add New Subject</h3>
                <form onSubmit={handleSubmit} className="flex gap-md items-end flex-wrap">
                    <div className="input-group flex-1">
                        <label>Subject Name</label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Mathematics"
                            required
                        />
                    </div>
                    <div className="input-group flex-1">
                        <label>Subject Code</label>
                        <input
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                            placeholder="MATH101"
                            required
                        />
                    </div>
                    <div className="input-group flex-1">
                        <label>Type</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                        >
                            <option value="THEORY">Theory</option>
                            <option value="PRACTICAL">Practical</option>
                            <option value="LAB">Lab</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary mb-md" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Subject"}
                    </button>
                </form>
            </div>

            <div className="card">
                <h3>All Subjects</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((s) => (
                            <tr key={s.id}>
                                <td>{s.code}</td>
                                <td>{s.name}</td>
                                <td>
                                    <span className="badge badge-blue">{s.type}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
