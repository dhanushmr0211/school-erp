const { supabaseAdmin } = require('../services/supabaseClient');

/**
 * CREATE STUDENT (Global Student Master)
 */
const createStudent = async (req, res) => {
    try {
        const {
            roll_number,
            dob,
            name,
            father_name,
            mother_name,
            father_occupation,
            mother_occupation,
            address,
            contact,
            siblings // [{ name, age }]
        } = req.body;

        if (!roll_number || !name) {
            return res.status(400).json({ error: 'Roll number and Name are required' });
        }

        // 1️⃣ Insert student
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .insert([{
                roll_number,
                dob,
                name,
                father_name,
                mother_name,
                father_occupation,
                mother_occupation,
                address,
                contact
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
        const { data, error } = await supabaseAdmin
            .from('students')
            .select('*')
            .order('name', { ascending: true });

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

module.exports = {
    createStudent,
    getStudents,
    getStudentById
};
