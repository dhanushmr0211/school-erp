const { supabaseAdmin } = require('../services/supabaseClient');

/**
 * CREATE STUDENT (Global Student Master)
 */
const createStudent = async (req, res) => {
    try {
        const {
            dob,
            name,
            father_name,
            mother_name,
            father_occupation,
            mother_occupation,
            address,

            contact,
            siblings, // [{ name, age }]
            registered_date // Optional, date string
        } = req.body;

        const academicYearId = req.headers['x-academic-year'];

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (!academicYearId) {
            return res.status(400).json({ error: 'Academic year is required' });
        }

        // 1️⃣ Auto-generate Admission Number
        const { data: maxAdData } = await supabaseAdmin
            .from('students')
            .select('admission_number')
            .order('admission_number', { ascending: false })
            .limit(1)
            .single();

        const newAdmissionNumber = (maxAdData?.admission_number || 0) + 1;

        // 2️⃣ Insert student
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .insert([{
                admission_number: newAdmissionNumber,
                dob,
                name,
                father_name,
                mother_name,
                father_occupation,
                mother_occupation,
                address,
                contact,
                registered_date: new Date().toISOString().split('T')[0],
                academic_year_id: academicYearId
            }])
            .select()
            .single();

        if (studentError) {
            throw studentError;
        }

        // 2️⃣ Insert siblings (if any)
        if (siblings && Array.isArray(siblings) && siblings.length > 0) {
            const siblingsData = siblings.map(s => ({
                student_id: student.id,
                name: s.name,
                age: s.age
            }));

            const { error: siblingError } = await supabaseAdmin
                .from('student_siblings')
                .insert(siblingsData);

            if (siblingError) {
                console.error('Sibling insert failed:', siblingError);
            }
        }

        res.status(201).json(student);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ error: 'Failed to create student' });
    }
};

/**
 * GET ALL STUDENTS
 */
const getStudents = async (req, res) => {
    try {
        const academicYearId = req.headers['x-academic-year'];

        if (!academicYearId) {
            return res.status(400).json({ error: 'Academic year is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('students')
            .select(`
                *,
                enrollments:student_class_enrollments (
                    class_id,
                    academic_year_id
                )
            `)
            .eq('academic_year_id', academicYearId)
            .order('roll_number', { ascending: true });

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

/**
 * GET SINGLE STUDENT WITH SIBLINGS
 */

/**
 * GET SINGLE STUDENT WITH SIBLINGS
 */
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('students')
            .select(`
                *,
                student_siblings (
                    id,
                    name,
                    age
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
};

/**
 * UPDATE STUDENT & SIBLINGS
 */
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            roll_number,
            dob,
            name,
            siblings // [{ name, age }] (Full replacement list is easier, but let's handle smart update?)
            // For simplicity in this user request context: delete existing siblings and re-insert is safest unless IDs are provided.
            // Since frontend sends "name, age" (maybe no IDs for new ones), re-creating is an option.
            // However, to keep IDs stable, let's just delete all and insert new ones or user upsert. 
            // Given the requirement "siblings... in editable form", let's replace them.
        } = req.body;

        if (!id) return res.status(400).json({ error: "Student ID required" });

        // 1. Update Student Table
        const { error: updateError } = await supabaseAdmin
            .from('students')
            .update({ roll_number, dob, name })
            .eq('id', id);

        if (updateError) throw updateError;

        // 2. Handle Siblings (Replace All Strategy for Simplicity/Reliability)
        if (siblings) {
            // Delete existing
            const { error: deleteError } = await supabaseAdmin
                .from('student_siblings')
                .delete()
                .eq('student_id', id);

            if (deleteError) throw deleteError;

            // Insert new list
            if (Array.isArray(siblings) && siblings.length > 0) {
                const siblingsData = siblings.map(s => ({
                    student_id: id,
                    name: s.name,
                    age: s.age
                }));

                const { error: insertError } = await supabaseAdmin
                    .from('student_siblings')
                    .insert(siblingsData);

                if (insertError) throw insertError;
            }
        }

        res.json({ success: true, message: "Student updated successfully" });

    } catch (err) {
        console.error("Update student error:", err);
        res.status(500).json({ error: "Failed to update student" });
    }
}

/**
 * DELETE STUDENT
 */
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const academicYearId = req.headers['x-academic-year'];

        if (!id) return res.status(400).json({ error: "Student ID required" });

        if (!academicYearId) {
            return res.status(400).json({ error: 'Academic year is required' });
        }

        // Verify student belongs to current academic year
        const { data: student, error: fetchError } = await supabaseAdmin
            .from('students')
            .select('academic_year_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching student:', fetchError);
            throw fetchError;
        }

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        if (student.academic_year_id !== academicYearId) {
            return res.status(403).json({
                error: 'Cannot delete student from a different academic year'
            });
        }

        // Delete enrollments first (cascade)
        const { error: enrollmentError } = await supabaseAdmin
            .from('student_class_enrollments')
            .delete()
            .eq('student_id', id);

        if (enrollmentError) {
            console.error('Error deleting enrollments:', enrollmentError);
            throw enrollmentError;
        }

        // Delete siblings
        const { error: siblingsError } = await supabaseAdmin
            .from('student_siblings')
            .delete()
            .eq('student_id', id);

        if (siblingsError) {
            console.error('Error deleting siblings:', siblingsError);
            throw siblingsError;
        }

        // Delete student
        const { error } = await supabaseAdmin
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: "Student and all related records deleted successfully" });
    } catch (err) {
        console.error("Delete student error:", err);
        res.status(500).json({ error: "Failed to delete student" });
    }
}

/**
 * GET STUDENT FULL PROFILE (Details, Class, Marks)
 */
const getStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { academic_year_id } = req.query;

        if (!id || !academic_year_id) {
            return res.status(400).json({ error: "Student ID and Academic Year ID required" });
        }

        // 1. Fetch Student & Enrollment
        // Note: We use Filter on the nested join for academic_year_id
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .select(`
                *,
                student_siblings(*),
                enrollments:student_class_enrollments(
                    class_id,
                    academic_year_id,
                    class:classes(id, class_name, section)
                )
            `)
            .eq('id', id)
            .single();

        if (studentError) throw studentError;

        // 2. Fetch Marks for this Academic Year
        const { data: marks, error: marksError } = await supabaseAdmin
            .from('marks')
            .select(`
                *,
                subject:subjects(id, name, code)
            `)
            .eq('student_id', id)
            .eq('academic_year_id', academic_year_id);

        if (marksError) throw marksError;

        // Filter enrollment for specific year
        const currentEnrollment = student.enrollments?.find(e => e.academic_year_id == academic_year_id);

        res.json({
            student: student,
            current_class: currentEnrollment ? currentEnrollment.class : null,
            marks: marks
        });

    } catch (err) {
        console.error("Fetch profile error:", err);
        res.status(500).json({ error: "Failed to fetch student profile" });
    }
}

module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    getStudentProfile, // Added
    updateStudent,
    deleteStudent
};
