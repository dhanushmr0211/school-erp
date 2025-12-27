
import { useEffect, useState } from "react";
import { fetchFaculties, createFaculty } from "../../services/adminFacultyApi";
import { fetchSubjects, assignSubjectsToFaculty } from "../../services/adminSubjectApi";
import { useAcademicYear } from "../../context/AcademicYearContext"; // Fixed import

export default function FacultyPage() {
    const [faculties, setFaculties] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { academicYearId } = useAcademicYear();

    const [form, setForm] = useState({ name: "", email: "", user_id: "" });
    const [selectedSubjects, setSelectedSubjects] = useState({});

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
        setForm({ name: "", email: "", user_id: "" });
        const facultyData = await fetchFaculties();
        setFaculties(facultyData);
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
                    <div className="input-group flex-1">
                        <label>Supabase User ID</label>
                        <input
                            name="user_id"
                            value={form.user_id}
                            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary mb-md">Add Faculty</button>
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
                        {faculties.map((f) => (
                            <tr key={f.id}>
                                <td>{f.name}</td>
                                <td>{f.email}</td>
                                <td>
                                    <select
                                        multiple
                                        value={selectedSubjects[f.id] || []}
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
                                </td>
                                <td>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => assignSubjectsToFaculty(f.id, selectedSubjects[f.id] || [])}
                                    >
                                        Assign
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
