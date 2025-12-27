import { apiFetch } from "./apiClient";


export function fetchSubjects() {
  return apiFetch("/admin/subjects");
}

export function createSubject(data) {
  return apiFetch("/admin/subjects", {
    method: "POST",
    body: data,
  });
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
