const { supabaseAdmin } = require('../services/supabaseClient');

const createFaculty = async (req, res) => {
  try {
    const { name, email, academic_year_id } = req.body;

    if (!name || !email || !academic_year_id) {
      return res.status(400).json({
        error: "name, email, academic_year_id are required",
      });
    }

    const { data: existing } = await supabaseAdmin
      .from('faculties')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        error: "Faculty already exists",
      });
    }

    const { data, error } = await supabaseAdmin
      .from('faculties')
      .insert([{ name, email, academic_year_id }])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Create faculty error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFaculties = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('faculties')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({ error: 'Failed to fetch faculties' });
  }
};

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

    if (!data) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
};

module.exports = {
  createFaculty,
  getFaculties,
  getFacultyById,
};
