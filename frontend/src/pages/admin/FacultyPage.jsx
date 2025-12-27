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
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    user_id: "", // ✅ REQUIRED (Supabase Auth User ID)
  });

  const { academicYearId } = useAcademicYear();

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    async function loadData() {
      const facultyData = await fetchFaculties();
      const subjectData = await fetchSubjects();
      setFaculties(facultyData);
      setSubjects(subjectData);
      setLoading(false);
    }
    loadData();
  }, []);

  /* -------------------- HANDLERS -------------------- */
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!academicYearId) {
      alert("Please select Academic Year first");
      return;
    }

    await createFaculty({
      name: form.name,
      email: form.email,
      user_id: form.user_id,           // ✅ CRITICAL
      academic_year_id: academicYearId,
    });

    setForm({ name: "", email: "", user_id: "" });
    setFaculties(await fetchFaculties());
  }

  /* -------------------- RENDER -------------------- */
  if (loading) return <p>Loading faculties...</p>;

  return (
    <div>
      <h2>Faculty Management</h2>

      {/* ADD FACULTY FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
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

        <input
          name="user_id"
          placeholder="Supabase User ID"
          value={form.user_id}
          onChange={handleChange}
        />
        <br />

        <button type="submit">Add Faculty</button>
      </form>

      <hr />

      {/* FACULTY LIST */}
      <ul>
        {faculties.map((f) => (
          <li key={f.id} style={{ marginBottom: "20px" }}>
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
