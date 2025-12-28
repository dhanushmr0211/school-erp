const { supabaseAdmin } = require('../services/supabaseClient');

/* ================= CREATE FACULTY ================= */

/* ================= CREATE FACULTY ================= */
const createFaculty = async (req, res) => {
  try {
    const { name, email, academic_year_id } = req.body;

    if (!name || !email || !academic_year_id) {
      return res.status(400).json({
        error: "name, email, academic_year_id are required",
      });
    }

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: "Faculty@123", // Default password
      email_confirm: true,
      user_metadata: { role: 'FACULTY', name }
    });

    if (authError) {
      // If user already exists, we need to handle it.
      // However, fetching by email is not directly exposed easily.
      // For now, return the error.
      console.error("Auth creation failed:", authError);
      return res.status(400).json({ error: `Auth Error: ${authError.message}` });
    }

    const userId = authData.user.id;

    // 2. Insert into Faculties table
    const { data, error } = await supabaseAdmin
      .from('faculties')
      .insert([
        {
          name,
          email,
          academic_year_id,
          user_id: userId,
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
