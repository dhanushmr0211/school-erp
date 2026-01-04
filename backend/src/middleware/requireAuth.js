const { supabaseAnon } = require("../services/supabaseClient");

module.exports = async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Missing token" });
        }

        const token = authHeader.split(" ")[1];
        // console.log("Middleware Verifying Token (Anon):", token.substring(0, 10) + "...");

        const {
            data: { user },
            error,
        } = await supabaseAnon.auth.getUser(token);

        if (error) {
            console.error("requireAuth Anon error:", error);
            return res.status(401).json({ error: "Invalid token: " + error.message });
        }

        if (!user) {
            console.error("requireAuth: No user found for token");
            return res.status(401).json({ error: "User not found" });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (err) {
        console.error("Auth error:", err);
        res.status(500).json({ error: "Auth failed" });
    }
};
