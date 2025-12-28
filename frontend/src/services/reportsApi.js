import { supabase } from "./supabaseClient";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function getReportCard(admissionNumber, academicYearId) {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {
        "Authorization": `Bearer ${session?.access_token}`,
        "Content-Type": "application/json", // Not strictly needed for GET but safe
    };

    if (academicYearId) {
        headers["x-academic-year"] = academicYearId;
    }

    const query = `?admission_number=${admissionNumber}&academic_year_id=${academicYearId}`;
    const res = await fetch(`${BASE_URL}/reports/report-card${query}`, {
        method: "GET",
        headers
    });

    if (!res.ok) {
        throw new Error("Failed to generate report");
    }

    // Return blob for PDF
    return res.blob();
}
