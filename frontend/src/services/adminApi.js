import { apiFetch } from "./apiClient";


export function fetchAcademicYears() {
  return apiFetch("/admin/academic-years");
}


export function fetchAdminStats(academicYearId) {
  return Promise.all([
    apiFetch("/admin/students", { academicYearId }),
    apiFetch(`/admin/classes?academic_year_id=${academicYearId}`),
    apiFetch("/admin/faculties"),
  ]);
}
