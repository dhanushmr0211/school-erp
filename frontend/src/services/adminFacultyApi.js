import { apiFetch } from "./apiClient";

export function fetchFaculties() {
  return apiFetch("/admin/faculty");
}


export function createFaculty(data) {
  return apiFetch("/admin/faculty", {
    method: "POST",
    body: data,
  });
}

export function updateFaculty(id, data) {
  return apiFetch(`/admin/faculty/${id}`, {
    method: "PUT",
    body: data,
  });
}

export function fetchFacultiesBySubject(subjectId) {
  return apiFetch(`/admin/faculty-subjects?subject_id=${subjectId}`);
}
