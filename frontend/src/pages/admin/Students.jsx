import { useEffect, useState } from "react";
import { fetchStudents, createStudent, enrollStudentToClass, fetchStudentFees } from "../../services/adminStudentApi";
import { fetchClasses } from "../../services/adminClassApi";
import { useAcademicYear } from "../../context/AcademicYearContext"; // Fixed import

export default function Students() {
    const { academicYearId } = useAcademicYear();
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ first_name: "", last_name: "", email: "", date_of_birth: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enrollModal, setEnrollModal] = useState(null); // student object
    const [selectedClassId, setSelectedClassId] = useState("");

    useEffect(() => {
        if (academicYearId) {
            loadData();
            loadClasses();
        }
    }, [academicYearId]);

    async function loadData() {
        try {
            const data = await fetchStudents(academicYearId);
            setStudents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function loadClasses() {
        const data = await fetchClasses(academicYearId);
        setClasses(data);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createStudent({ ...form, academic_year_id: academicYearId });
            setForm({ first_name: "", last_name: "", email: "", date_of_birth: "" });
            loadData();
        } catch (err) {
            alert("Failed to create student");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleEnroll() {
        if (!enrollModal || !selectedClassId) return;
        try {
            await enrollStudentToClass(enrollModal.id, selectedClassId, academicYearId);
            alert("Student Enrolled!");
            setEnrollModal(null);
            setSelectedClassId("");
        } catch (err) {
            alert("Failed to enroll");
        }
    }

    if (loading) return <div className="p-4">Loading students...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Student Management</h1>
            </div>

            <div className="card">
                <h3>Register New Student</h3>
                <form onSubmit={handleSubmit} className="flex gap-md items-end flex-wrap">
                    <div className="input-group flex-1">
                        <label>First Name</label>
                        <input
                            value={form.first_name}
                            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group flex-1">
                        <label>Last Name</label>
                        <input
                            value={form.last_name}
                            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group flex-1">
                        <label>Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group flex-1">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            value={form.date_of_birth}
                            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary mb-md" disabled={isSubmitting}>
                        Register Student
                    </button>
                </form>
            </div>

            <div className="card">
                <h3>All Students</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>DOB</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.id}>
                                <td>{s.first_name} {s.last_name}</td>
                                <td>{s.email}</td>
                                <td>{s.date_of_birth}</td>
                                <td>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                                        onClick={() => setEnrollModal(s)}
                                    >
                                        Enroll to Class
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {enrollModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
                }}>
                    <div className="card" style={{ width: "400px" }}>
                        <h3>Enroll {enrollModal.first_name}</h3>
                        <div className="mb-md">
                            <label>Select Class</label>
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                            >
                                <option value="">-- Select --</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-md justify-between">
                            <button className="btn btn-secondary" onClick={() => setEnrollModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleEnroll}>Enroll</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
