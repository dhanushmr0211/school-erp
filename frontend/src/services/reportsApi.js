import { apiFetch } from "./apiClient";

export function getReportCard(studentId, academicYearId) {
    const query = `?student_id=${studentId}&academic_year_id=${academicYearId}`;
    return apiFetch(`/reports/report-card${query}`);
}
