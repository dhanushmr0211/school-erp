const { supabaseAnon } = require('../services/supabaseClient');

const requireStudent = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const role = user.user_metadata?.role;

        if (role !== 'STUDENT') {
            return res.status(403).json({ error: 'Access denied: Students only' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = requireStudent;
