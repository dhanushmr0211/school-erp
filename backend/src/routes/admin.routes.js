const express = require('express');
const requireAdmin = require('../middleware/requireAdmin');

const { getAcademicYears, createAcademicYear } =
  require('../controllers/adminAcademicYear.controller');

const { getSubjects, createSubject } =
  require('../controllers/adminSubjects.controller');

const { createFaculty, getFaculties, getFacultyById } =
  require('../controllers/adminFaculty.controller');

const { assignSubjectToFaculty, getFacultiesBySubject } =
  require('../controllers/adminFacultySubjects.controller');

const { createClass, getClasses, getClassById } =
  require('../controllers/adminClasses.controller');

const { assignSubjectToClass, getClassSubjects } =
  require('../controllers/adminClassSubjects.controller');

const { createStudent, getStudents, getStudentById } =
  require('../controllers/adminStudents.controller');

const { enrollStudentsToClass, getClassStudents } =
  require('../controllers/adminStudentClass.controller');

const { upsertStudentFees, getStudentFees } =
  require('../controllers/adminStudentFees.controller');

const router = express.Router();

/* Academic Years */
router.get('/academic-years', requireAdmin, getAcademicYears);
router.post('/academic-years', requireAdmin, createAcademicYear);

/* Subjects */
router.get('/subjects', requireAdmin, getSubjects);
router.post('/subjects', requireAdmin, createSubject);

/* Faculty */
router.post('/faculty', requireAdmin, createFaculty);
router.get('/faculty', requireAdmin, getFaculties);
router.get('/faculty/:id', requireAdmin, getFacultyById);

/* Faculty Subjects */
router.post('/faculty-subjects', requireAdmin, assignSubjectToFaculty);
router.get('/faculty-subjects', requireAdmin, getFacultiesBySubject);

/* Classes */
router.post('/classes', requireAdmin, createClass);
router.get('/classes', requireAdmin, getClasses);
router.get('/classes/:id', requireAdmin, getClassById);

/* Class Subjects */
router.post('/class-subjects', requireAdmin, assignSubjectToClass);
router.get('/class-subjects', requireAdmin, getClassSubjects);

/* Students */
router.post('/students', requireAdmin, createStudent);
router.get('/students', requireAdmin, getStudents);
router.get('/students/:id', requireAdmin, getStudentById);

/* Enrollments */
router.post('/class-enrollments', requireAdmin, enrollStudentsToClass);
router.get('/class-enrollments', requireAdmin, getClassStudents);

/* Fees */
router.post('/student-fees', requireAdmin, upsertStudentFees);
router.get('/student-fees', requireAdmin, getStudentFees);

module.exports = router;
