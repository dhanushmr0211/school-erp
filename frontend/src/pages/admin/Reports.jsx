import { useState } from "react";
import { getReportCard } from "../../services/reportsApi";
import { useAcademicYear } from "../../context/AcademicYearContext"; // Fixed import

export default function Reports() {
    const { academicYearId } = useAcademicYear();
    const [admissionNumber, setAdmissionNumber] = useState("");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleGenerate() {
        if (!admissionNumber || !academicYearId) return alert("Enter Admission Number and select Academic Year");
        setLoading(true);
        try {
            const blob = await getReportCard(admissionNumber, academicYearId);

            // Create a link to download the PDF
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report_card_${admissionNumber}.pdf`; // Ideally fetch filename from headers but this is fine
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert("Report generated successfully!");
            setReportData(null); // Clear previous data/errors
        } catch (err) {
            console.error(err);
            alert("Failed to fetch report");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1>Reports</h1>
            </div>

            <div className="card">
                <h3>Generate Student Report Card</h3>
                <div className="flex gap-md items-end">
                    <div className="input-group flex-1">
                        <label>Admission Number</label>
                        <input
                            type="number"
                            value={admissionNumber}
                            onChange={(e) => setAdmissionNumber(e.target.value)}
                            placeholder="e.g. 1"
                            required
                        />
                    </div>
                    <button onClick={handleGenerate} className="btn btn-primary" disabled={loading}>
                        {loading ? "Generating..." : "Generate PDF"}
                    </button>
                </div>
            </div>
        </div>
    );
}
