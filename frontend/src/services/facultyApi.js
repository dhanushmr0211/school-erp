import { apiFetch } from "./apiClient";

export function fetchFacultyDashboard(academicYearId) {
    const query = academicYearId ? `?academic_year_id=${academicYearId}` : "";
    return apiFetch(`/faculty/dashboard${query}`);
}

export function upsertMarks(data) {
    return apiFetch("/faculty/marks", {
        method: "POST",
        body: data,
    });
}

export function fetchMarks(classId, subjectId, examType) {
    const query = `?class_id=${classId}&subject_id=${subjectId}&exam_type=${examType}`;
    return apiFetch(`/faculty/marks${query}`);
}
