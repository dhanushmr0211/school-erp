const { supabaseAdmin } = require("../services/supabaseClient");

module.exports = async function requireAdmin(req, res, next) {
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

    const role =
      user.app_metadata?.role ||
      user.user_metadata?.role;

    if (role !== "ADMIN") {
      return res.status(403).json({ error: "Admins only" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Admin auth error:", err);
    res.status(500).json({ error: "Auth failed" });
  }
};
