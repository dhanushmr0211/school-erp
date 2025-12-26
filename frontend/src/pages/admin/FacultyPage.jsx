

import { useEffect, useState } from "react";
import {
    fetchFaculties,
    createFaculty,
} from "../../services/adminFacultyApi";
import {
    fetchSubjects,
    assignSubjectsToFaculty,
} from "../../services/adminSubjectApi";
import { useAcademicYear } from "../../context/AcademicYearContext";



export default function FacultyPage() {

    /* -------------------- STATE -------------------- */
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        email: "",
    });

    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState({});
    const { academicYearId } = useAcademicYear();
    

    /* -------------------- EFFECTS -------------------- */
    useEffect(() => {
        fetchFaculties()
            .then(setFaculties)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchSubjects().then(setSubjects);
    }, []);

    /* -------------------- HANDLERS -------------------- */
    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

   async function handleSubmit(e) {
  e.preventDefault();

  if (!academicYearId) {
    alert("Select Academic Year first");
    return;
  }

  await createFaculty({
    name: form.name,
    email: form.email,
    academic_year_id: academicYearId,
  });

  setForm({ name: "", email: "" });
  setFaculties(await fetchFaculties());
}

    /* -------------------- LOADING -------------------- */
    if (loading) return <p>Loading faculties...</p>;

    /* -------------------- UI -------------------- */
    return (
        console.log("ACADEMIC YEAR ID:", academicYearId),
        <div>
            <h2>Faculty Management</h2>
            

            {/* ADD FACULTY FORM */}
            <form onSubmit={handleSubmit}>
                <input
                    name="name"
                    placeholder="Faculty Name"
                    value={form.name}
                    onChange={handleChange}
                />
                <br />

                <input
                    name="email"
                    placeholder="Faculty Email"
                    value={form.email}
                    onChange={handleChange}
                />
                <br />

                <button>Add Faculty</button>
            </form>

            {/* FACULTY LIST */}
            <ul>
                {faculties.map((f) => (
                    <li key={f.id}>
                        <b>{f.name}</b> — {f.email}
                        <br />

                        <select
                            multiple
                            value={selectedSubjects[f.id] || []}
                            onChange={(e) => {
                                const values = Array.from(
                                    e.target.selectedOptions
                                ).map((o) => o.value);

                                setSelectedSubjects({
                                    ...selectedSubjects,
                                    [f.id]: values,
                                });
                            }}
                        >
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>

                        <br />

                        <button
                            onClick={() =>
                                assignSubjectsToFaculty(
                                    f.id,
                                    selectedSubjects[f.id] || []
                                )
                            }
                        >
                            Assign Subjects
                        </button>

                        <hr />
                    </li>
                ))}
            </ul>
        </div>
    );
}
