
import { useEffect, useState } from "react";
import { fetchFaculties, createFaculty } from "../../services/adminFacultyApi";
import { fetchSubjects, assignSubjectsToFaculty } from "../../services/adminSubjectApi";
import { useAcademicYear } from "../../context/AcademicYearContext";

export default function FacultyPage() {
    const [faculties, setFaculties] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { academicYearId } = useAcademicYear();


    const [form, setForm] = useState({ name: "", email: "" });
    const [selectedSubjects, setSelectedSubjects] = useState({});
    const [editingId, setEditingId] = useState(null); // ID of the faculty currently being edited

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const facultyData = await fetchFaculties();
        const subjectData = await fetchSubjects();
        setFaculties(facultyData);
        setSubjects(subjectData);

        const initialSelected = {};
        facultyData.forEach(f => {
            if (f.faculty_subjects && f.faculty_subjects.length > 0) {
                initialSelected[f.id] = f.faculty_subjects.map(fs => fs.subject_id);
            }
        });
        setSelectedSubjects(initialSelected);

        setLoading(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!academicYearId) return alert("Select Academic Year");

        await createFaculty({
            ...form,
            academic_year_id: academicYearId,
        });

        setForm({ name: "", email: "" });
        loadData();
    }

    async function handleSave(facultyId) {
        try {
            await assignSubjectsToFaculty(facultyId, selectedSubjects[facultyId] || []);
            setEditingId(null);
            await loadData(); // Reload to refresh view
        } catch (err) {
            alert("Failed to assign subjects");
        }
    }

    function getSubjectNames(assignedIds) {
        if (!assignedIds || assignedIds.length === 0) return "No subjects assigned";
        return assignedIds.map(id => {
            const subj = subjects.find(s => s.id === id);
            return subj ? `${subj.name} (${subj.code})` : "Unknown";
        }).join(", ");
    }

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Faculty Management</h1>
            </div>


            <div className="card">
                <h3>Add New Faculty</h3>
                <form onSubmit={handleSubmit} className="flex gap-md items-end flex-wrap">
                    <div className="input-group flex-1">
                        <label>Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group flex-1">
                        <label>Email</label>
                        <input
                            name="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Add Faculty</button>
                </form>
            </div>

            <div className="card">
                <h3>Faculty List</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Assigned Subjects</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculties.map((f) => {
                            const isEditing = editingId === f.id;
                            const assignedIds = selectedSubjects[f.id] || [];

                            return (
                                <tr key={f.id}>
                                    <td>{f.name}</td>
                                    <td>{f.email}</td>
                                    <td>
                                        {isEditing ? (
                                            <select
                                                multiple
                                                value={assignedIds}
                                                onChange={(e) => {
                                                    const values = Array.from(e.target.selectedOptions).map(o => o.value);
                                                    setSelectedSubjects({ ...selectedSubjects, [f.id]: values });
                                                }}
                                                style={{ height: "100px" }}
                                            >
                                                {subjects.map((s) => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span>{getSubjectNames(assignedIds)}</span>
                                        )}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <div className="flex gap-sm">
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                                                    onClick={() => handleSave(f.id)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        loadData(); // Reset changes by reloading
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => setEditingId(f.id)}
                                            >
                                                Edit Assignments
                                            </button>
                                        )}
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
