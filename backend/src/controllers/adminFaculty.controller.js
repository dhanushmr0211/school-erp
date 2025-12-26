const { supabaseAdmin } = require("../services/supabaseClient");

const createFaculty = async (req, res) => {
  try {
    const { name, email, academic_year_id } = req.body;

    if (!name || !email || !academic_year_id) {
      return res.status(400).json({
        error: "name, email, academic_year_id are required",
      });
    }

    const { data: existing } = await supabaseAdmin
      .from("faculties")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: "Faculty already exists" });
    }

    const { data, error } = await supabaseAdmin
      .from("faculties")
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
  const { data, error } = await supabaseAdmin
    .from("faculties")
    .select("*")
    .order("name");

  if (error) return res.status(500).json(error);
  res.json(data);
};

module.exports = {
  createFaculty,
  getFaculties,
};
