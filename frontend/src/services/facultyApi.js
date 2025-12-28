import { apiFetch } from "./apiClient";

export function fetchFacultyDashboard(academicYearId) {
    return apiFetch(`/faculty/dashboard`); // Query param removed, relying on header
}

export function upsertMarks(data) {
    return apiFetch("/faculty/marks", {
        method: "POST",
        body: data,
    });
}

export function fetchMarks(classId, subjectId, examType, academicYearId) {
    const query = `?class_id=${classId}&subject_id=${subjectId}&exam_type=${examType}&academic_year_id=${academicYearId}`;
    return apiFetch(`/faculty/marks${query}`);
}
