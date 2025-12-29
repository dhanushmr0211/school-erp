import { apiFetch } from "./apiClient";

export function fetchClasses(academicYearId) {
    const query = academicYearId ? `?academic_year_id=${academicYearId}` : "";
    return apiFetch(`/admin/classes${query}`);
}

export function createClass(data) {
    return apiFetch("/admin/classes", {
        method: "POST",
        body: data,
    });
}


export function assignSubjectToClass(classId, subjectId, facultyId) {
    return apiFetch("/admin/class-subjects", {
        method: "POST",
        body: {
            class_id: classId,
            subject_id: subjectId,
            faculty_id: facultyId
        },
    });
}


export function fetchClassSubjects(classId) {
    return apiFetch(`/admin/class-subjects?class_id=${classId}`);
}

export function updateClass(id, data) {
    return apiFetch(`/admin/classes/${id}`, {
        method: "PUT",
        body: data
    });
}

export function deleteClass(id) {
    return apiFetch(`/admin/classes/${id}`, {
        method: "DELETE"
    });
}

export function enrollStudentsToClass(data) {
    // data: { class_id, academic_year_id, student_ids: [] }
    return apiFetch("/admin/class-enrollments", {
        method: "POST",
        body: data
    });
}

export function fetchClassStudents(classId) {
    return apiFetch(`/admin/class-enrollments?class_id=${classId}`);
}

export function removeStudentFromClass(classId, studentId) {
    return apiFetch(`/admin/class-enrollments/${classId}/${studentId}`, {
        method: "DELETE"
    });
}

export function removeClassSubject(id) {
    return apiFetch(`/admin/class-subjects/${id}`, {
        method: "DELETE"
    });
}
