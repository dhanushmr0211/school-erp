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

export function activateAcademicYear(id) {
  return apiFetch(`/admin/academic-years/${id}/activate`, {
    method: "PUT"
  });
}

export function syncAcademicYearData(fromYearId, toYearId) {
  return apiFetch("/admin/academic-years/sync-data", {
    method: "POST",
    body: { from_year_id: fromYearId, to_year_id: toYearId }
  });
}

export function fetchAdminStats(academicYearId) {
  return apiFetch(`/admin/dashboard-stats?academic_year_id=${academicYearId}`);
}

