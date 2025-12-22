const { supabaseAdmin } = require('../services/supabaseClient');

const getStudentMarks = async (req, res) => {
    try {
        const { academic_year_id } = req.query;
        // Assuming the auth middleware attaches user_metadata correctly.
        // Ensure that when creating the user, 'student_id' is added to user_metadata OR app_metadata.
        const studentId = req.user.user_metadata?.student_id;

        if (!studentId || !academic_year_id) {
            return res.status(400).json({ error: 'Student ID not found in token or Academic Year ID missing' });
        }

        const { data, error } = await supabaseAdmin
            .from('marks')
            .select(`
        *,
        subject:subjects (
          id,
          name
        )
      `)
            .eq('student_id', studentId)
            .eq('academic_year_id', academic_year_id);

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching student marks:', error);
        res.status(500).json({ error: 'Failed to fetch marks' });
    }
};

const getStudentFees = async (req, res) => {
    try {
        const { academic_year_id } = req.query;
        const studentId = req.user.user_metadata?.student_id;

        if (!studentId || !academic_year_id) {
            return res.status(400).json({ error: 'Student ID not found in token or Academic Year ID missing' });
        }

        const { data, error } = await supabaseAdmin
            .from('student_fees')
            .select('*')
            .eq('student_id', studentId)
            .eq('academic_year_id', academic_year_id);

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching student fees:', error);
        res.status(500).json({ error: 'Failed to fetch student fees' });
    }
};

module.exports = {
    getStudentMarks,
    getStudentFees,
};
