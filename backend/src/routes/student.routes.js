const express = require('express');
const requireStudent = require('../middleware/requireStudent');
const academicYearGuard = require('../middleware/academicYearGuard');
const { getStudentMarks, getStudentFees } = require('../controllers/studentDashboard.controller');

const router = express.Router();

router.get('/marks', requireStudent, academicYearGuard, getStudentMarks);
router.get('/fees', requireStudent, academicYearGuard, getStudentFees);

module.exports = router;
