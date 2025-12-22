const { supabaseAdmin } = require('../services/supabaseClient');

const assignSubjectToFaculty = async (req, res) => {
    try {
        const { faculty_id, subject_id } = req.body;

        if (!faculty_id || !subject_id) {
            return res.status(400).json({ error: 'Faculty ID and Subject ID are required' });
        }

        const { data, error } = await supabaseAdmin
            .from('faculty_subjects')
            .insert([{ faculty_id, subject_id }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error assigning subject to faculty:', error);
        res.status(500).json({ error: 'Failed to assign subject to faculty' });
    }
};

const getFacultiesBySubject = async (req, res) => {
    try {
        const { subject_id } = req.query;

        if (!subject_id) {
            return res.status(400).json({ error: 'Subject ID is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('faculty_subjects')
            .select(`
        faculty_id,
        faculties (
          id,
          name,
          qualification
        )
      `)
            .eq('subject_id', subject_id);

        if (error) {
            throw error;
        }

        // Flatten the response to return just the faculty details if preferred, 
        // or keep the structure. Usually, returning the joined data is fine.
        // Let's return the structured data directly.
        res.json(data);
    } catch (error) {
        console.error('Error fetching faculties by subject:', error);
        res.status(500).json({ error: 'Failed to fetch faculties by subject' });
    }
};

module.exports = {
    assignSubjectToFaculty,
    getFacultiesBySubject,
};
