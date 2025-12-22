const { supabaseAnon } = require('../services/supabaseClient');

const requireFaculty = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization header missing or invalid' });
        }

        const token = authHeader.split(' ')[1];

        const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const role = user.user_metadata?.role;

        if (role !== 'FACULTY') {
            return res.status(403).json({ error: 'Access denied: Faculty only' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({ error: 'Internal server error during auth' });
    }
};

module.exports = requireFaculty;
