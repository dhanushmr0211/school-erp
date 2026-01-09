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
    const academicYearId = req.headers['x-academic-year'];

    if (!academicYearId) {
      return res.status(400).json({ error: 'Academic year is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('faculties')
      .select('*, faculty_subjects(subject_id)')
      .eq('academic_year_id', academicYearId)
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

/* ================= DELETE FACULTY ================= */
const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const academicYearId = req.headers['x-academic-year'];

    if (!id) {
      return res.status(400).json({ error: 'Faculty ID is required' });
    }

    if (!academicYearId) {
      return res.status(400).json({ error: 'Academic year is required' });
    }

    // Verify faculty belongs to current academic year
    const { data: faculty, error: fetchError } = await supabaseAdmin
      .from('faculties')
      .select('academic_year_id, user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching faculty:', fetchError);
      throw fetchError;
    }

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    if (faculty.academic_year_id !== academicYearId) {
      return res.status(403).json({
        error: 'Cannot delete faculty from a different academic year'
      });
    }

    // Delete class_subject_faculty assignments
    const { error: assignmentError } = await supabaseAdmin
      .from('class_subject_faculty')
      .delete()
      .eq('faculty_id', id);

    if (assignmentError) {
      console.error('Error deleting class_subject_faculty:', assignmentError);
      throw assignmentError;
    }

    // Delete faculty_subjects
    const { error: subjectError } = await supabaseAdmin
      .from('faculty_subjects')
      .delete()
      .eq('faculty_id', id);

    if (subjectError) {
      console.error('Error deleting faculty_subjects:', subjectError);
      throw subjectError;
    }

    // Delete faculty record
    const { error: facultyError } = await supabaseAdmin
      .from('faculties')
      .delete()
      .eq('id', id);

    if (facultyError) {
      console.error('Error deleting faculty:', facultyError);
      throw facultyError;
    }

    // Optionally delete auth user
    if (faculty.user_id) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(faculty.user_id);
      if (authError) {
        console.error('Error deleting auth user:', authError);
        // Don't throw - faculty record is already deleted
      }
    }

    res.json({ success: true, message: 'Faculty and all related records deleted successfully' });
  } catch (err) {
    console.error('Delete faculty error:', err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= EXPORTS ================= */
module.exports = {
  createFaculty,
  getFaculties,
  getFacultyById,
  deleteFaculty,
};
