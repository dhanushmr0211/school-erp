const { supabaseAdmin } = require("../services/supabaseClient");

module.exports = async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Missing token" });
        }

        const token = authHeader.split(" ")[1];

        const {
            data: { user },
            error,
        } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: "Invalid token" });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (err) {
        console.error("Auth error:", err);
        res.status(500).json({ error: "Auth failed" });
    }
};
