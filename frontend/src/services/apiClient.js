import { supabase } from "./supabaseClient";

const BASE_URL = import.meta.env.VITE_API_URL;

// Cache the session to avoid repeated await supabase.auth.getSession()
let cachedSession = null;

// Initialize session and listen for changes
supabase.auth.getSession().then(({ data }) => {
  cachedSession = data.session;
});

supabase.auth.onAuthStateChange((_event, session) => {
  cachedSession = session;
});

export async function apiFetch(path, options = {}) {
  // Use cached session if available, otherwise fetch once
  if (!cachedSession) {
    const { data } = await supabase.auth.getSession();
    cachedSession = data.session;
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (cachedSession?.access_token) {
    headers.Authorization = `Bearer ${cachedSession.access_token}`;
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
