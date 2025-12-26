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
