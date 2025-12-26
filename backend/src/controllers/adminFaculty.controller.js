const { supabaseAdmin } = require("../services/supabaseClient");

exports.createFaculty = async (req, res) => {
  try {
    const { name, email, academic_year_id } = req.body;

    if (!name || !email || !academic_year_id) {
      return res.status(400).json({
        error: "name, email, academic_year_id are required",
      });
    }

    // 1️⃣ Create Auth user
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { role: "FACULTY" },
      });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // 2️⃣ Insert faculty with user_id
    const { data, error } = await supabaseAdmin
      .from("faculties")
      .insert([
        {
          user_id: authUser.user.id,
          name,
          email,
          academic_year_id,
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


const getFaculties = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("faculties")
    .select("*")
    .order("name");

  if (error) return res.status(500).json(error);
  res.json(data);
};
const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('faculties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
};


module.exports = {
  createFaculty,
  getFaculties,
  getFacultyById,
};
