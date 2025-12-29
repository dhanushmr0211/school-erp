const { supabaseAdmin } = require('../services/supabaseClient');

const assignSubjectToClass = async (req, res) => {
    try {
        const { class_id, subject_id, faculty_id } = req.body;

        if (!class_id || !subject_id || !faculty_id) {
            return res.status(400).json({ error: 'Class ID, Subject ID, and Faculty ID are required' });
        }

        const { data, error } = await supabaseAdmin
            .from('class_subject_faculty')
            .insert([{ class_id, subject_id, faculty_id }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error assigning subject to class:', error);
        res.status(500).json({ error: 'Failed to assign subject to class' });
    }
};

const getClassSubjects = async (req, res) => {
    try {
        const { class_id } = req.query;

        if (!class_id) {
            return res.status(400).json({ error: 'Class ID is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('class_subject_faculty')
            .select(`
        *,
        subject:subjects (
          id,
          name
        ),
        faculty:faculties (
          id,
          name,
          qualification
        )
      `)
            .eq('class_id', class_id);

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching class subjects:', error);
        res.status(500).json({ error: 'Failed to fetch class subjects' });
    }
};

const removeClassSubject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Assignment ID is required' });
        }

        const { error } = await supabaseAdmin
            .from('class_subject_faculty')
            .delete()
            .match({ id });

        if (error) throw error;

        res.json({ message: 'Subject assignment removed from class successfully' });
    } catch (error) {
        console.error('Error removing subject from class:', error);
        res.status(500).json({ error: 'Failed to remove subject from class' });
    }
};

module.exports = {
    assignSubjectToClass,
    getClassSubjects,
    removeClassSubject
};
