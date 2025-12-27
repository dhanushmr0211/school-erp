import { useEffect, useState } from "react";
import { fetchClasses, createClass, assignSubjectsToClass, fetchClassSubjects } from "../../services/adminClassApi";
import { fetchSubjects } from "../../services/adminSubjectApi";
import { useAcademicYear } from "../../context/AcademicYearContext"; // Fixed import path

export default function Classes() {
    const { academicYearId } = useAcademicYear();
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ class_name: "", section: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [assignmentSubjects, setAssignmentSubjects] = useState([]);

    useEffect(() => {
        if (academicYearId) {
            loadData();
            loadSubjects();
        }
    }, [academicYearId]);

    async function loadData() {
        try {
            const data = await fetchClasses(academicYearId);
            setClasses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function loadSubjects() {
        const data = await fetchSubjects();
        setSubjects(data);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!academicYearId) return alert("Select Academic Year");

        setIsSubmitting(true);
        try {
            await createClass({ ...form, academic_year_id: academicYearId });
            setForm({ class_name: "", section: "" });
            loadData();
        } catch (err) {
            alert("Failed to create class");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleAssignSubjects() {
        if (!selectedClass) return;
        try {
            await assignSubjectsToClass(selectedClass.id, assignmentSubjects);
            alert("Subjects Assigned!");
            setSelectedClass(null);
            setAssignmentSubjects([]);
        } catch (err) {
            alert("Failed to assign subjects");
        }
    }

    if (loading) return <div className="p-4">Loading classes...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Classes Management</h1>
            </div>

            <div className="card">
                <h3>Create New Class</h3>
                <form onSubmit={handleSubmit} className="flex gap-md items-end flex-wrap">
                    <div className="input-group flex-1">
                        <label>Class Name (e.g. Grade 10)</label>
                        <input
                            value={form.class_name}
                            onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group flex-1">
                        <label>Section (e.g. A)</label>
                        <input
                            value={form.section}
                            onChange={(e) => setForm({ ...form, section: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary mb-md" disabled={isSubmitting}>
                        Create Class
                    </button>
                </form>
            </div>

            <div className="card">
                <h3>Existing Classes</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Section</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((c) => (
                            <tr key={c.id}>
                                <td>{c.class_name}</td>
                                <td>{c.section}</td>
                                <td>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                                        onClick={() => {
                                            setSelectedClass(c);
                                            setAssignmentSubjects([]); // Reset or fetch existing
                                        }}
                                    >
                                        Assign Subjects
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedClass && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
                }}>
                    <div className="card" style={{ width: "500px", maxHeight: "80vh", overflowY: "auto" }}>
                        <h3>Assign Subjects to {selectedClass.class_name} - {selectedClass.section}</h3>
                        <div className="mb-md" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            {subjects.map((s) => (
                                <label key={s.id} className="flex items-center gap-sm">
                                    <input
                                        type="checkbox"
                                        checked={assignmentSubjects.includes(s.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setAssignmentSubjects([...assignmentSubjects, s.id]);
                                            else setAssignmentSubjects(assignmentSubjects.filter(id => id !== s.id));
                                        }}
                                        style={{ width: "auto" }}
                                    />
                                    {s.name} ({s.code})
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-md justify-between">
                            <button className="btn btn-secondary" onClick={() => setSelectedClass(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAssignSubjects}>Save Assignments</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
