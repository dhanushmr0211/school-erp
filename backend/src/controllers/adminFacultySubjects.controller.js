const { supabaseAdmin } = require('../services/supabaseClient');



exports.assignSubjectToFaculty = async (req, res) => {
  try {
    const { faculty_id, subject_ids } = req.body;

    if (!faculty_id || !Array.isArray(subject_ids) || subject_ids.length === 0) {
      return res.status(400).json({
        error: "faculty_id and subject_ids array are required",
      });
    }

    const rows = subject_ids.map((subject_id) => ({
      faculty_id,
      subject_id,
    }));

    const { error } = await supabaseAdmin
      .from("faculty_subjects")
      .insert(rows);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("Assign subject error:", err);
    res.status(500).json({ error: err.message });
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
