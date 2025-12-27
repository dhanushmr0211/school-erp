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

export function assignSubjectsToClass(classId, subjectIds) {
    return apiFetch("/admin/class-subjects", {
        method: "POST",
        body: {
            class_id: classId,
            subject_ids: subjectIds,
        },
    });
}

export function fetchClassSubjects(classId) {
    return apiFetch(`/admin/class-subjects?class_id=${classId}`);
}
