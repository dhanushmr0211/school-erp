import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

const INACTIVITY_LIMIT_MS = 72 * 60 * 60 * 1000; // 72 hours

export default function InactivityTracker() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        // Don't track if unauthenticated or on public pages
        if (
            !user ||
            location.pathname === "/login" ||
            location.pathname === "/" ||
            location.pathname === "/session-expired"
        ) {
            return;
        }

        const checkInactivity = () => {
            const lastActivity = localStorage.getItem("last_activity_time");
            if (lastActivity) {
                const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
                if (timeSinceLastActivity > INACTIVITY_LIMIT_MS) {
                    // Log out the user to clear session properly and prevent auto-login
                    supabase.auth.signOut().then(() => {
                        localStorage.clear();
                        navigate("/session-expired");
                    });
                }
            }
        };

        const updateInactivity = () => {
            const lastActivity = localStorage.getItem("last_activity_time");
            const now = Date.now();

            // Throttle writes: only update localStorage at most once every minute 
            // instead of every single mouse movement!
            if (!lastActivity || now - parseInt(lastActivity, 10) > 60000) {
                localStorage.setItem("last_activity_time", now.toString());
            }
        };

        // Set initial activity time on mount if missing
        if (!localStorage.getItem("last_activity_time")) {
            localStorage.setItem("last_activity_time", Date.now().toString());
        }

        // Check inactivity strictly on load and every minute
        checkInactivity();
        const intervalId = setInterval(checkInactivity, 60000);

        // Activity triggers
        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        events.forEach((event) => window.addEventListener(event, updateInactivity));

        return () => {
            clearInterval(intervalId);
            events.forEach((event) => window.removeEventListener(event, updateInactivity));
        };
    }, [user, location.pathname, navigate]);

    return null; // Component renders invisibly
}
