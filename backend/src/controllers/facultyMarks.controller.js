const { supabaseAdmin } = require('../services/supabaseClient');

const upsertMarks = async (req, res) => {
    try {
        const {
            class_id,
            subject_id,
            academic_year_id,
            exam_type,
            marks, // Array of { student_id, marks_obtained }
        } = req.body;

        if (!class_id || !subject_id || !academic_year_id || !exam_type || !marks || !Array.isArray(marks)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let max_marks = 0;
        const type = exam_type.toUpperCase();

        if (['TEST1', 'TEST2', 'TEST3', 'TEST4'].includes(type)) {
            max_marks = 25;
        } else if (['SEM1', 'SEM2'].includes(type)) {
            max_marks = 50;
        } else {
            return res.status(400).json({ error: 'Invalid exam type. Must be TEST1-4 or SEM1-2' });
        }

        const marksData = marks.map((entry) => ({
            class_id,
            subject_id,
            academic_year_id,
            exam_type: type,
            student_id: entry.student_id,
            marks_obtained: entry.marks_obtained,
            max_marks,
        }));

        // upsert requires a unique constraint to update instead of fail on duplicate.
        // Assuming unique constraint on (student_id, class_id, subject_id, exam_type, academic_year_id)
        const { data, error } = await supabaseAdmin
            .from('marks')
            .upsert(marksData)
            .select();

        if (error) {
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error upserting marks:', error);
        res.status(500).json({ error: 'Failed to save marks' });
    }
};

const getMarks = async (req, res) => {
    try {
        const { class_id, subject_id, academic_year_id, exam_type } = req.query;

        if (!class_id || !subject_id || !academic_year_id || !exam_type) {
            return res.status(400).json({ error: 'Missing required query parameters' });
        }

        const { data, error } = await supabaseAdmin
            .from('marks')
            .select(`
        *,
        students (
          id,
          name,
          roll_number
        )
      `)
            .eq('class_id', class_id)
            .eq('subject_id', subject_id)
            .eq('academic_year_id', academic_year_id)
            .eq('exam_type', exam_type);

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching marks:', error);
        res.status(500).json({ error: 'Failed to fetch marks' });
    }
};

module.exports = {
    upsertMarks,
    getMarks,
};
