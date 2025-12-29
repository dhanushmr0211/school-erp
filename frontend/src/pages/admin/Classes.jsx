
import { useEffect, useState } from "react";
import {
    fetchClasses, createClass, assignSubjectToClass, fetchClassSubjects,
    deleteClass, updateClass, enrollStudentsToClass, fetchClassStudents,
    removeStudentFromClass, removeClassSubject
} from "../../services/adminClassApi";

import { fetchSubjects } from "../../services/adminSubjectApi";
import { fetchStudents } from "../../services/adminStudentApi";
import { fetchFacultiesBySubject } from "../../services/adminFacultyApi";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { Pencil, Trash2, Eye, UserPlus } from "lucide-react";

export default function Classes() {
    const { academicYearId } = useAcademicYear();
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ class_name: "", section: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    const [modalType, setModalType] = useState(null); // 'assign', 'details', 'add_students'

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

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this class?")) return;
        try {
            await deleteClass(id);
            loadData();
        } catch (err) {
            alert("Delete failed");
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
                                    <div className="flex gap-sm">
                                        <button
                                            className="btn btn-secondary"
                                            title="Assign Subjects"
                                            onClick={() => {
                                                setSelectedClass(c);
                                                setModalType('assign');
                                            }}
                                        >
                                            <Pencil size={16} /> Subjects
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            title="Add Students"
                                            onClick={() => {
                                                setSelectedClass(c);
                                                setModalType('add_students');
                                            }}
                                        >
                                            <UserPlus size={16} />
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            title="View Details"
                                            onClick={() => {
                                                setSelectedClass(c);
                                                setModalType('details');
                                            }}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            title="Delete Class"
                                            onClick={() => handleDelete(c.id)}
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

            {selectedClass && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
                }}>
                    {modalType === 'assign' && (
                        <AssignSubjectModal
                            cls={selectedClass}
                            allSubjects={subjects}
                            onClose={() => setSelectedClass(null)}
                        />
                    )}
                    {modalType === 'details' && (
                        <ClassDetailModal
                            cls={selectedClass}
                            allSubjects={subjects}
                            onClose={() => setSelectedClass(null)}
                            onUpdate={loadData}
                        />
                    )}
                    {modalType === 'add_students' && (
                        <AddStudentModal
                            cls={selectedClass}
                            academicYearId={academicYearId}
                            onClose={() => setSelectedClass(null)}
                        />
                    )}
                </div>
            )}

        </div>
    );
}

function AssignSubjectModal({ cls, allSubjects, onClose }) {
    const [assignedList, setAssignedList] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [eligibleFaculty, setEligibleFaculty] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAssigned();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            fetchEligibleFaculty(selectedSubject);
        } else {
            setEligibleFaculty([]);
            setSelectedFaculty("");
        }
    }, [selectedSubject]);

    async function loadAssigned() {
        try {
            const data = await fetchClassSubjects(cls.id);
            setAssignedList(data);
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchEligibleFaculty(subjectId) {
        try {
            const data = await fetchFacultiesBySubject(subjectId);
            setEligibleFaculty(data);
        } catch (err) {
            console.error("Failed to fetch faculty", err);
        }
    }

    async function handleAssign() {
        if (!selectedSubject || !selectedFaculty) return alert("Select Subject and Faculty");
        setLoading(true);
        try {
            await assignSubjectToClass(cls.id, selectedSubject, selectedFaculty);
            await loadAssigned();
            setSelectedSubject("");
            setSelectedFaculty("");
            alert("Assigned successfully");
        } catch (err) {
            alert("Failed to assign: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card" style={{ width: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <h3>Assign Subjects to {cls.class_name} ({cls.section})</h3>

            <div className="card bg-gray-dark mb-md">
                <h4>New Assignment</h4>
                <div className="flex gap-md mb-sm">
                    <div className="flex-1">
                        <label>Subject</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                            <option value="">Select Subject</option>
                            {allSubjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label>Faculty</label>

                        <select value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)} disabled={!selectedSubject}>
                            <option value="">Select Faculty</option>
                            {eligibleFaculty.map(faculty => (
                                <option key={faculty.id} value={faculty.id}>
                                    {faculty.name} ({faculty.qualification || "N/A"})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <button onClick={handleAssign} disabled={loading} className="btn btn-primary w-full">
                    Assign Subject & Teacher
                </button>
            </div>

            <div>
                <h4>Current Assignments</h4>
                <table style={{ fontSize: "0.9rem" }}>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Teacher</th>
                            {/* <th>Action</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {assignedList.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.subject?.name}</td>
                                <td>{item.faculty?.name}</td>
                                {/* <td><button className="btn btn-danger btn-sm">X</button></td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {assignedList.length === 0 && <p className="text-gray">No subjects assigned yet.</p>}
            </div>

            <div className="mt-md text-right">
                <button onClick={onClose} className="btn btn-secondary">Close</button>
            </div>
        </div>
    );
}

function ClassDetailModal({ cls, allSubjects, onClose, onUpdate }) {
    const [editMode, setEditMode] = useState(false);
    const [className, setClassName] = useState(cls.class_name);
    const [section, setSection] = useState(cls.section);

    // Associated Data
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        loadDetails();
    }, []);

    async function loadDetails() {
        try {
            const [studentsData, subjectsData] = await Promise.all([
                fetchClassStudents(cls.id),
                fetchClassSubjects(cls.id)
            ]);
            setStudents(studentsData);
            setSubjects(subjectsData);
        } catch (err) {
            console.error("Failed to load class details", err);
        }
    }

    async function handleSave() {
        try {
            await updateClass(cls.id, { class_name: className, section });
            setEditMode(false);
            onUpdate(); // refresh parent list
            alert("Class updated");
        } catch (err) {
            alert("Update failed");
        }
    }

    async function handleRemoveStudent(studentId) {
        if (!confirm("Remove this student from the class?")) return;
        try {
            await removeStudentFromClass(cls.id, studentId);
            loadDetails(); // Reload to refresh list
        } catch (err) {
            alert("Failed to remove student");
        }
    }

    async function handleRemoveSubject(assignmentId) {
        if (!confirm("Remove this subject assignment?")) return;
        try {
            await removeClassSubject(assignmentId);
            loadDetails(); // Reload to refresh list
        } catch (err) {
            alert("Failed to remove subject");
        }
    }

    return (
        <div className="card" style={{ width: "800px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="flex justify-between items-center mb-md">
                {editMode ? (
                    <div className="flex gap-sm">
                        <input value={className} onChange={e => setClassName(e.target.value)} placeholder="Class Name" />
                        <input value={section} onChange={e => setSection(e.target.value)} placeholder="Section" />
                        <button onClick={handleSave} className="btn btn-success btn-sm">Save</button>
                        <button onClick={() => setEditMode(false)} className="btn btn-secondary btn-sm">Cancel</button>
                    </div>
                ) : (
                    <h3>{className} - {section} <button onClick={() => setEditMode(true)} className="btn btn-sm btn-secondary mx-2"><Pencil size={14} /></button></h3>
                )}
                <button onClick={onClose} className="btn btn-secondary">Close</button>
            </div>

            <div className="grid grid-cols-2 gap-md">
                <div>
                    <h4>Assigned Subjects & Faculty</h4>
                    {/* Reuse existing list logic or simple view */}
                    <table style={{ fontSize: "0.85rem" }}>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Teacher</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.subject?.name}</td>
                                    <td>{item.faculty?.name}</td>
                                    <td>
                                        <button
                                            onClick={() => handleRemoveSubject(item.id)}
                                            className="btn btn-danger btn-sm"
                                            style={{ padding: '2px 6px' }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {subjects.length === 0 && <p className="text-gray text-sm">No subjects.</p>}
                </div>
                <div>
                    <h4>Enrolled Students ({students.length})</h4>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        <table style={{ fontSize: "0.85rem" }}>
                            <thead>
                                <tr>
                                    <th>Roll</th>
                                    <th>Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((item, idx) => (

                                    <tr key={idx}>
                                        <td>{item.roll_number || "-"}</td>
                                        <td>{item.students?.name}</td>
                                        <td>
                                            <button
                                                onClick={() => handleRemoveStudent(item.student_id)}
                                                className="btn btn-danger btn-sm"
                                                style={{ padding: '2px 6px' }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {students.length === 0 && <p className="text-gray text-sm">No students enrolled.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AddStudentModal({ cls, academicYearId, onClose }) {
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (academicYearId && cls.id) {
            Promise.all([
                fetchStudents(academicYearId),
                fetchClassStudents(cls.id)
            ]).then(([all, enrolled]) => {
                // enrolled is array of { student_id, students: {...} }
                // Filter out students who are ALREADY enrolled in THIS class OR ANY OTHER class for this academic year.
                // Note: fetchStudents now returns `enrollments` array.
                const available = all.filter(s => {
                    // Check if enrolled in ANY class for this academic year
                    // The backend `enrollments` might contain enrollments from other years too? 
                    // Yes, so we filter by academicYearId.
                    const alreadyEnrolledThisYear = s.enrollments && s.enrollments.some(e => e.academic_year_id == academicYearId);

                    // We also have `enrolled` list for this specific class, but `alreadyEnrolledThisYear` covers it AND others.
                    return !alreadyEnrolledThisYear;
                });
                setAllStudents(available);
                setLoading(false);
            }).catch(err => {
                console.error("Failed to fetch data", err);
                setLoading(false);
            });
        }
    }, [academicYearId, cls.id]);

    function toggleStudent(id) {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(s => s !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    }

    async function handleEnroll() {
        if (selectedStudents.length === 0) return;
        try {
            await enrollStudentsToClass({
                class_id: cls.id,
                academic_year_id: academicYearId,
                student_ids: selectedStudents
            });
            alert("Students Enrolled!");
            onClose();
        } catch (err) {
            alert("Enrollment failed: " + err.message);
        }
    }

    return (
        <div className="card" style={{ width: "500px", maxHeight: "80vh", overflowY: "auto" }}>
            <h3>Add Students to {cls.class_name}</h3>
            {loading ? <p>Loading students...</p> : (
                <>
                    <div className="mb-md" style={{ maxHeight: "400px", overflowY: "auto" }}>
                        <table style={{ fontSize: "0.85rem" }}>
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>Roll</th>
                                    <th>Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allStudents.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(s.id)}
                                                onChange={() => toggleStudent(s.id)}
                                            />
                                        </td>
                                        <td>{s.roll_number}</td>
                                        <td>{s.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end gap-md">
                        <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleEnroll} disabled={selectedStudents.length === 0} className="btn btn-primary">Enroll Selected ({selectedStudents.length})</button>
                    </div>
                </>
            )}
        </div>
    );
}
