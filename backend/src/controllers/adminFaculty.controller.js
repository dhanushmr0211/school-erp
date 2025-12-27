const { supabaseAdmin } = require('../services/supabaseClient');

/* ================= CREATE FACULTY ================= */
const createFaculty = async (req, res) => {
  try {
    const { name, email, academic_year_id, user_id } = req.body;

    if (!name || !email || !academic_year_id || !user_id) {
      return res.status(400).json({
        error: "name, email, academic_year_id, user_id are required",
      });
    }

    const { data: existing } = await supabaseAdmin
      .from('faculties')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(400).json({
        error: "Faculty already exists",
      });
    }

    const { data, error } = await supabaseAdmin
      .from('faculties')
      .insert([
        {
          name,
          email,
          academic_year_id,
          user_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Create faculty error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET FACULTIES ================= */
const getFaculties = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin

      .from('faculties')
      .select('*, faculty_subjects(subject_id)')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET FACULTY BY ID ================= */
const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('faculties')
      .select(`
        *,
        faculty_subjects (
          subject_id,
          subjects ( id, name )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= EXPORTS ================= */
module.exports = {
  createFaculty,
  getFaculties,
  getFacultyById,
};
