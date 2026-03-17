import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function SessionExpired() {
    const navigate = useNavigate();

    const handleFix = async () => {
        // Clear local storage to wipe any corrupted data
        localStorage.clear();
        // Force sign out from supabase to clear any leftover tokens
        await supabase.auth.signOut();
        // Redirect to login page
        navigate("/login");
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f4f6",
            padding: "1rem"
        }}>
            <div style={{
                maxWidth: "500px",
                background: "white",
                padding: "2.5rem",
                borderRadius: "15px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                textAlign: "center"
            }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#e11d48", marginBottom: "1rem" }}>
                    Authentication Error
                </h1>
                <p style={{ color: "#4b5563", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                    Oops! It looks like your authentication session has expired or become corrupted.
                    This can happen if you logged in on another device, or if your browser's local storage data is out of sync.
                </p>
                <p style={{ color: "#4b5563", marginBottom: "2rem", lineHeight: "1.6" }}>
                    <strong>How to Fix:</strong> Click the button below to automatically clear your corrupted session data and log in fresh.
                </p>
                <button
                    onClick={handleFix}
                    style={{
                        background: "#6366f1",
                        color: "white",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        fontSize: "1rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "background 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.background = "#4f46e5"}
                    onMouseOut={(e) => e.target.style.background = "#6366f1"}
                >
                    Fix Session & Login Again
                </button>
            </div>
        </div>
    );
}
