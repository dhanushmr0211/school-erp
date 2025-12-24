const { supabaseAdmin } = require("../services/supabaseClient");

exports.getFaculties = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("faculties")
    .select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};
