const express = require('express');
const requireStudent = require('../middleware/requireStudent');
const academicYearGuard = require('../middleware/academicYearGuard');
const { getStudentMarks, getStudentFees, getStudentClasses } = require('../controllers/studentDashboard.controller');

const router = express.Router();

router.get('/marks', requireStudent, academicYearGuard, getStudentMarks);
router.get('/fees', requireStudent, academicYearGuard, getStudentFees);
router.get('/classes', requireStudent, academicYearGuard, getStudentClasses);

module.exports = router;
