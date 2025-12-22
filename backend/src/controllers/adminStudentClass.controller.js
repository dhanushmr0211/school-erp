const { supabaseAdmin } = require('../services/supabaseClient');

const enrollStudentsToClass = async (req, res) => {
    try {
        const { class_id, academic_year_id, student_ids } = req.body;

        if (!class_id || !academic_year_id || !student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
            return res.status(400).json({ error: 'Class ID, Academic Year ID, and a list of Student IDs are required' });
        }

        // Prepare enrollments
        const enrollments = student_ids.map((student_id) => ({
            class_id,
            academic_year_id,
            student_id,
        }));

        // Perform bulk insert.
        // Note: To enforce one-class-per-student-per-academic-year, we should ideally have a unique constraint on the DB level 
        // (student_id, academic_year_id). If we do, we can use `upsert` or rely on duplication error.
        // Assuming DB constraints exist or we just want to insert:
        const { data, error } = await supabaseAdmin
            .from('student_class_enrollments')
            .insert(enrollments)
            .select();

        if (error) {
            // Check for unique constraint violation (code 23505 in Postgres)
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Some students are already enrolled in a class for this academic year' });
            }
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error enrolling students:', error);
        res.status(500).json({ error: 'Failed to enroll students' });
    }
};

const getClassStudents = async (req, res) => {
    try {
        const { class_id } = req.query;

        if (!class_id) {
            return res.status(400).json({ error: 'Class ID is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('student_class_enrollments')
            .select(`
        student_id,
        students (
          id,
          name,
          roll_number
        )
      `)
            .eq('class_id', class_id);

        if (error) {
            throw error;
        }

        // Flatten logic if desired, but returning as is maintains structure
        res.json(data);
    } catch (error) {
        console.error('Error fetching class students:', error);
        res.status(500).json({ error: 'Failed to fetch class students' });
    }
};

module.exports = {
    enrollStudentsToClass,
    getClassStudents,
};
