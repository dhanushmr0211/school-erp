
import { useEffect, useState } from "react";
import { fetchStudents, createStudent, enrollStudentToClass, fetchStudentFees, deleteStudent, updateStudent, fetchStudentById } from "../../services/adminStudentApi";
import { fetchClasses } from "../../services/adminClassApi";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { Trash2, Pencil, Banknote } from "lucide-react";
import FeesModal from "./FeesModal";

export default function Students() {
    const { academicYearId } = useAcademicYear();
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        roll_number: "",
        dob: "",
        siblings: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enrollModal, setEnrollModal] = useState(null); // student object for enrollment
    const [selectedClassId, setSelectedClassId] = useState("");

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", roll_number: "", dob: "", siblings: [] });

    const [feesModalOpen, setFeesModalOpen] = useState(false);
    const [selectedStudentForFees, setSelectedStudentForFees] = useState(null);

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
            const validSiblings = form.siblings.filter(s => s.name && s.age);
            await createStudent({
                ...form,
                siblings: validSiblings,
                academic_year_id: academicYearId
            });
            setForm({ name: "", roll_number: "", dob: "", siblings: [] });
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

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            await deleteStudent(id);
            loadData();
        } catch (err) {
            alert("Failed to delete student");
        }
    }

    async function handleEditClick(id) {
        try {
            const data = await fetchStudentById(id);
            setEditingId(id);
            setEditForm({
                name: data.name,
                roll_number: data.roll_number,
                dob: data.dob,
                siblings: data.student_siblings || [] // Ensure siblings are loaded
            });
            setEditModalOpen(true);
        } catch (err) {
            alert("Failed to load student details");
        }
    }

    async function handleUpdate(e) {
        e.preventDefault();
        try {
            const validSiblings = editForm.siblings.filter(s => s.name && s.age);
            await updateStudent(editingId, { ...editForm, siblings: validSiblings });

            setEditModalOpen(false);
            setEditingId(null);
            loadData();
            alert("Student updated successfully");
        } catch (err) {
            alert("Failed to update student");
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
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-md flex-wrap mb-md">
                        <div className="input-group flex-1">
                            <label>Name</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Full Name"
                                required
                            />
                        </div>

                        <div className="input-group flex-1">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                value={form.dob}
                                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-md">
                        <label className="mb-sm block font-bold">Siblings (Optional)</label>
                        {form.siblings.map((sibling, index) => (
                            <div key={index} className="flex gap-sm mb-sm items-center">
                                <input
                                    placeholder="Sibling Name"
                                    value={sibling.name}
                                    onChange={(e) => {
                                        const newSiblings = [...form.siblings];
                                        newSiblings[index].name = e.target.value;
                                        setForm({ ...form, siblings: newSiblings });
                                    }}
                                    className="flex-1"
                                />
                                <input
                                    type="number"
                                    placeholder="Age"
                                    value={sibling.age}
                                    onChange={(e) => {
                                        const newSiblings = [...form.siblings];
                                        newSiblings[index].age = e.target.value;
                                        setForm({ ...form, siblings: newSiblings });
                                    }}
                                    style={{ width: "80px" }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => {
                                        const newSiblings = form.siblings.filter((_, i) => i !== index);
                                        setForm({ ...form, siblings: newSiblings });
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setForm({ ...form, siblings: [...form.siblings, { name: "", age: "" }] })}
                        >
                            + Add Sibling
                        </button>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        Register Student
                    </button>
                </form>
            </div>

            <div className="card">
                <h3>All Students</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Adm No.</th>
                            <th>Name</th>
                            <th>DOB</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s, index) => (
                            <tr key={s.id}>
                                <td>{s.admission_number || "-"}</td>
                                <td>
                                    <div className="font-bold">{s.name}</div>
                                    <div className="text-sm text-gray">{s.registered_date}</div>
                                </td>
                                <td>{s.dob}</td>
                                <td style={{ textAlign: "right" }}>
                                    <div className="flex gap-sm justify-end">
                                        <button
                                            onClick={() => {
                                                setSelectedStudentForFees(s);
                                                setFeesModalOpen(true);
                                            }}
                                            className="btn btn-primary"
                                            style={{ padding: "0.25rem 0.5rem" }}
                                            title="Manage Fees"
                                        >
                                            <Banknote size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(s.id)}
                                            className="btn btn-secondary"
                                            style={{ padding: "0.25rem 0.5rem" }}
                                            title="Edit Student"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            className="btn btn-danger"
                                            style={{ padding: "0.25rem 0.5rem" }}
                                            title="Delete Student"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ENROLL MODAL */}
            {enrollModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
                }}>
                    <div className="card" style={{ width: "400px" }}>
                        <h3>Enroll {enrollModal.name}</h3>
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
            )
            }

            {/* EDIT MODAL */}
            {
                editModalOpen && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
                    }}>
                        <div className="card" style={{ width: "600px", maxHeight: "90vh", overflowY: "auto" }}>
                            <h3>Edit Student Details</h3>
                            <form onSubmit={handleUpdate}>
                                <div className="flex gap-md flex-wrap mb-md">
                                    <div className="input-group flex-1">
                                        <label>Name</label>
                                        <input
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-group flex-1">
                                        <label>Date of Birth</label>
                                        <input
                                            type="date"
                                            value={editForm.dob}
                                            onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-md">
                                    <label className="mb-sm block font-bold">Siblings</label>
                                    {editForm.siblings.map((sibling, index) => (
                                        <div key={index} className="flex gap-sm mb-sm items-center">
                                            <input
                                                placeholder="Sibling Name"
                                                value={sibling.name}
                                                onChange={(e) => {
                                                    const newSiblings = [...editForm.siblings];
                                                    newSiblings[index].name = e.target.value;
                                                    setEditForm({ ...editForm, siblings: newSiblings });
                                                }}
                                                className="flex-1"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Age"
                                                value={sibling.age}
                                                onChange={(e) => {
                                                    const newSiblings = [...editForm.siblings];
                                                    newSiblings[index].age = e.target.value;
                                                    setEditForm({ ...editForm, siblings: newSiblings });
                                                }}
                                                style={{ width: "80px" }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => {
                                                    const newSiblings = editForm.siblings.filter((_, i) => i !== index);
                                                    setEditForm({ ...editForm, siblings: newSiblings });
                                                }}
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setEditForm({ ...editForm, siblings: [...editForm.siblings, { name: "", age: "" }] })}
                                    >
                                        + Add Sibling
                                    </button>
                                </div>

                                <div className="flex gap-md justify-between">
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Update Student</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {feesModalOpen && selectedStudentForFees && (
                <FeesModal
                    student={selectedStudentForFees}
                    academicYearId={academicYearId}
                    onClose={() => setFeesModalOpen(false)}
                />
            )}
        </div >
    );
}
