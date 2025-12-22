const express = require('express');
const { supabaseAnon } = require('../services/supabaseClient');
const academicYearGuard = require('../middleware/academicYearGuard');
const { generateReportCard } = require('../controllers/reportCard.controller');

const router = express.Router();

// Custom middleware to allow both Admin and Student roles
const requireAdminOrStudent = async (req, res, next) => {
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

        const role = user.user_metadata?.role || user.app_metadata?.role;

        if (role === 'ADMIN' || role === 'STUDENT') {
            req.user = user;
            next();
        } else {
            return res.status(403).json({ error: 'Access denied: Admins or Students only' });
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

router.get('/report-card', requireAdminOrStudent, academicYearGuard, generateReportCard);

module.exports = router;
