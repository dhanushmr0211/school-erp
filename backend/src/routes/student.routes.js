const express = require('express');
const requireStudent = require('../middleware/requireStudent');
const academicYearGuard = require('../middleware/academicYearGuard');
const { getStudentMarks, getStudentFees, getStudentClasses, verifyStudent } = require('../controllers/studentDashboard.controller');

const { supabaseAdmin } = require('../services/supabaseClient'); // add import

const router = express.Router();

router.post('/verify', verifyStudent); // Public endpoint for login
// temp route to debug students
router.get('/debug-students', async (req, res) => {
    const { data } = await supabaseAdmin.from('students').select('*').limit(5);
    res.json(data);
});

router.get('/marks', requireStudent, academicYearGuard, getStudentMarks);
router.get('/fees', requireStudent, academicYearGuard, getStudentFees);
router.get('/classes', requireStudent, academicYearGuard, getStudentClasses);

module.exports = router;
