
import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

export default function UpdatePassword() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Supabase handles the session recovery via the hash fragment automatically
        // But we can check if we have a session just to be sure, or rely on the fact that
        // if the user lands here via email link, Supabase client should pick it up.

        // Actually, for PKCE flow (default in newer supabase), it might just set the session.
        // We'll trust the process.
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            alert("Error updating password: " + error.message);
        } else {
            alert("Password updated successfully!");
            navigate("/login");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <form onSubmit={handleUpdate} className="card w-96 space-y-4">
                <h1 className="text-xl font-bold text-center mb-md">Update Password</h1>
                <p className="text-center text-sm text-gray-400 mb-4">
                    Enter your new password below.
                </p>

                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}
