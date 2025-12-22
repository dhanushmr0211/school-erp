const express = require('express');
const requireFaculty = require('../middleware/requireFaculty');
const academicYearGuard = require('../middleware/academicYearGuard');
const { getFacultyClasses } = require('../controllers/facultyDashboard.controller');
const { upsertMarks, getMarks } = require('../controllers/facultyMarks.controller');

const router = express.Router();

router.get('/dashboard', requireFaculty, academicYearGuard, getFacultyClasses);

router.post('/marks', requireFaculty, academicYearGuard, upsertMarks);
router.get('/marks', requireFaculty, academicYearGuard, getMarks);

module.exports = router;
