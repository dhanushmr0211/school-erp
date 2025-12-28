import { apiFetch } from "./apiClient";

export function fetchStudents(academicYearId) {
    const query = academicYearId ? `?academic_year_id=${academicYearId}` : "";
    return apiFetch(`/admin/students${query}`);
}


export function createStudent(data) {
    return apiFetch("/admin/students", {
        method: "POST",
        body: data,
    });
}

export function updateStudent(id, data) {
    return apiFetch(`/admin/students/${id}`, {
        method: "PUT",
        body: data,
    });
}

export function deleteStudent(id) {
    return apiFetch(`/admin/students/${id}`, {
        method: "DELETE",
    });
}

export function fetchStudentById(id) {
    return apiFetch(`/admin/students/${id}`);
}

export function enrollStudentToClass(studentId, classId, academicYearId) {
    return apiFetch("/admin/class-enrollments", {
        method: "POST",
        body: {
            student_id: studentId,
            class_id: classId,
            academic_year_id: academicYearId,
        },
    });
}

export function fetchClassStudents(classId) {
    return apiFetch(`/admin/class-enrollments?class_id=${classId}`);
}

export function upsertStudentFees(data) {
    return apiFetch("/admin/student-fees", {
        method: "POST",
        body: data,
    });
}

export function fetchStudentFees(studentId, academicYearId) {
    return apiFetch(`/admin/student-fees?student_id=${studentId}&academic_year_id=${academicYearId}`);
}
