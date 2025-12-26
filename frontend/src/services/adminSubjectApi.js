import { apiFetch } from "./apiClient";

export function fetchSubjects() {
  return apiFetch("/admin/subjects");
}

export function assignSubjectsToFaculty(facultyId, subjectIds) {
  return apiFetch("/admin/faculty-subjects", {
    method: "POST",
    body: {
      faculty_id: facultyId,
      subject_ids: subjectIds,
    },
  });
}
