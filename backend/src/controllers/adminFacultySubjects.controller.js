const { supabaseAdmin } = require("../services/supabaseClient");

/**
 * POST /admin/faculty-subjects
 * body: { faculty_id, subject_ids: [] }
 */
const assignSubjectToFaculty = async (req, res) => {
  try {
    const { faculty_id, subject_ids } = req.body;

    if (!faculty_id || !Array.isArray(subject_ids) || subject_ids.length === 0) {
      return res.status(400).json({
        error: "faculty_id and subject_ids are required",
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
    console.error("Assign subjects error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /admin/faculty-subjects?subject_id=UUID
 */
const getFacultiesBySubject = async (req, res) => {
  try {
    const { subject_id } = req.query;

    if (!subject_id) {
      return res.status(400).json({
        error: "subject_id is required",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("faculty_subjects")
      .select(
        `
        faculty:faculties (
          id,
          name,
          email
        )
      `
      )
      .eq("subject_id", subject_id);

    if (error) throw error;

    res.json(data.map((d) => d.faculty));
  } catch (err) {
    console.error("Fetch faculties by subject error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  assignSubjectToFaculty,
  getFacultiesBySubject,
};
