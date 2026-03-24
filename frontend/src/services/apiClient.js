import { supabase } from "./supabaseClient";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const academicYearId = localStorage.getItem("academicYearId");
  if (academicYearId) {
    headers["x-academic-year"] = academicYearId;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const errorMessage = errData.error || "API Request Failed";

    if (res.status === 401) {
      if (window.location.pathname !== "/session-expired") {
        window.location.href = "/session-expired";
      }
    }

    throw new Error(errorMessage);
  }

  return res.json();
}
