import { apiFetch } from "./apiClient";

export function fetchStudentMarks(academicYearId) {
    const query = academicYearId ? `?academic_year_id=${academicYearId}` : "";
    return apiFetch(`/student/marks${query}`);
}

export function fetchStudentFees(academicYearId) {
    const query = academicYearId ? `?academic_year_id=${academicYearId}` : "";
    return apiFetch(`/student/fees${query}`);
}

export function fetchStudentClasses(academicYearId) {
    const query = academicYearId ? `?academic_year_id=${academicYearId}` : "";
    return apiFetch(`/student/classes${query}`);
}
