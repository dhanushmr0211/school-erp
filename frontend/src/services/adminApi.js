import { apiFetch } from "./apiClient";



export function fetchAcademicYears() {
  return apiFetch("/admin/academic-years");
}

export function createAcademicYear(data) {
  return apiFetch("/admin/academic-years", {
    method: "POST",
    body: data,
  });
}

export function fetchAdminStats(academicYearId) {
  return Promise.all([
    apiFetch("/admin/students", { academicYearId }),
    apiFetch(`/admin/classes?academic_year_id=${academicYearId}`),
    apiFetch("/admin/faculty"),
  ]);
}

