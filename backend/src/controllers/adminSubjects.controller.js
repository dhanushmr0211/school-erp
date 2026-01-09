const { supabaseAdmin } = require('../services/supabaseClient');

const getSubjects = async (req, res) => {
    try {
        const academicYearId = req.headers['x-academic-year'];

        if (!academicYearId) {
            return res.status(400).json({ error: 'Academic year is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('subjects')
            .select('*')
            .eq('academic_year_id', academicYearId)
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
};


const createSubject = async (req, res) => {
    try {
        const { name, code, type } = req.body;
        const academicYearId = req.headers['x-academic-year'];

        if (!name || !code || !type) {
            return res.status(400).json({ error: 'Name, code, and type are required' });
        }

        if (!academicYearId) {
            return res.status(400).json({ error: 'Academic year is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('subjects')
            .insert([{ name, code, type, academic_year_id: academicYearId }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({ error: 'Failed to create subject' });
    }
};


const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const academicYearId = req.headers['x-academic-year'];

        if (!id) {
            return res.status(400).json({ error: 'Subject ID is required' });
        }

        if (!academicYearId) {
            return res.status(400).json({ error: 'Academic year is required' });
        }

        // Verify subject belongs to current academic year
        const { data: subject, error: fetchError } = await supabaseAdmin
            .from('subjects')
            .select('academic_year_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching subject:', fetchError);
            throw fetchError;
        }

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        if (subject.academic_year_id !== academicYearId) {
            return res.status(403).json({
                error: 'Cannot delete subject from a different academic year'
            });
        }

        // Step 1: Delete from class_subject_faculty (references faculty_subjects)
        const { error: classSubjectFacultyError } = await supabaseAdmin
            .from('class_subject_faculty')
            .delete()
            .in('subject_id', [id]);

        if (classSubjectFacultyError) {
            console.error('Error deleting class_subject_faculty:', classSubjectFacultyError);
            throw classSubjectFacultyError;
        }

        // Step 2: Delete from faculty_subjects (references subjects)
        const { error: facultySubjectsError } = await supabaseAdmin
            .from('faculty_subjects')
            .delete()
            .eq('subject_id', id);

        if (facultySubjectsError) {
            console.error('Error deleting faculty_subjects:', facultySubjectsError);
            throw facultySubjectsError;
        }

        // Step 3: Delete the subject itself
        const { error: subjectError } = await supabaseAdmin
            .from('subjects')
            .delete()
            .eq('id', id);

        if (subjectError) {
            console.error('Error deleting subject:', subjectError);
            throw subjectError;
        }

        res.json({ success: true, message: "Subject and all related records deleted successfully" });
    } catch (err) {
        console.error("Delete subject error:", err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getSubjects,
    createSubject,
    deleteSubject,
};
