const express = require('express');
const requireAdmin = require('../middleware/requireAdmin');
const requireAuth = require('../middleware/requireAuth');

const { getAcademicYears, createAcademicYear } =
  require('../controllers/adminAcademicYear.controller');


const { getSubjects, createSubject, deleteSubject } =
  require('../controllers/adminSubjects.controller');

const { createFaculty, getFaculties, getFacultyById, deleteFaculty } =
  require('../controllers/adminFaculty.controller');

const { assignSubjectToFaculty, getFacultiesBySubject } =
  require('../controllers/adminFacultySubjects.controller');


const { createClass, getClasses, getClassById, updateClass, deleteClass } =
  require('../controllers/adminClasses.controller');

const { assignSubjectToClass, getClassSubjects } =
  require('../controllers/adminClassSubjects.controller');


const { createStudent, getStudents, getStudentById, getStudentProfile, updateStudent, deleteStudent } =
  require('../controllers/adminStudents.controller');

const { enrollStudentsToClass, getClassStudents } =
  require('../controllers/adminStudentClass.controller');

const { upsertStudentFees, getStudentFees } =
  require('../controllers/adminStudentFees.controller');

const router = express.Router();

/* Academic Years */
router.get('/academic-years', requireAuth, getAcademicYears);
router.post('/academic-years', requireAdmin, createAcademicYear);


/* Subjects */
router.get('/subjects', requireAdmin, getSubjects);
router.post('/subjects', requireAdmin, createSubject);
router.delete('/subjects/:id', requireAdmin, deleteSubject);

/* Faculty */
router.post('/faculty', requireAdmin, createFaculty);
router.get('/faculty', requireAdmin, getFaculties);
router.get('/faculty/:id', requireAdmin, getFacultyById);
router.delete('/faculty/:id', requireAdmin, deleteFaculty);

/* Faculty Subjects */
router.post('/faculty-subjects', requireAdmin, assignSubjectToFaculty);
router.get('/faculty-subjects', requireAdmin, getFacultiesBySubject);

/* Classes */

router.post('/classes', requireAdmin, createClass);
router.get('/classes', requireAdmin, getClasses);
router.get('/classes/:id', requireAdmin, getClassById);
router.put('/classes/:id', requireAdmin, updateClass);
router.delete('/classes/:id', requireAdmin, deleteClass);

/* Class Subjects */
router.post('/class-subjects', requireAdmin, assignSubjectToClass);
router.get('/class-subjects', requireAdmin, getClassSubjects);
const { removeClassSubject } = require('../controllers/adminClassSubjects.controller');
router.delete('/class-subjects/:id', requireAdmin, removeClassSubject);


/* Students */
router.post('/students', requireAdmin, createStudent);
router.get('/students', requireAdmin, getStudents);
router.get('/students/:id/profile', requireAdmin, getStudentProfile);
router.get('/students/:id', requireAdmin, getStudentById);
router.put('/students/:id', requireAdmin, updateStudent);
router.delete('/students/:id', requireAdmin, deleteStudent);

/* Enrollments */
router.post('/class-enrollments', requireAdmin, enrollStudentsToClass);
router.get('/class-enrollments', requireAuth, getClassStudents);
const { removeStudentFromClass } = require('../controllers/adminStudentClass.controller');
router.delete('/class-enrollments/:class_id/:student_id', requireAdmin, removeStudentFromClass);

/* Fees */
router.post('/student-fees', requireAdmin, upsertStudentFees);
router.get('/student-fees', requireAdmin, getStudentFees);

/* Promotion */
const { promoteClass } = require('../controllers/classPromotion.controller');
router.post('/promote-class', requireAdmin, promoteClass);

module.exports = router;
