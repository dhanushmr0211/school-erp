const { supabaseAdmin } = require('../services/supabaseClient');

const createClass = async (req, res) => {

    try {
        const { class_name, section, academic_year_id, class_teacher_id } = req.body;

        if (!class_name || !academic_year_id) {
            return res.status(400).json({ error: 'Class name and Academic Year ID are required' });
        }

        const { data, error } = await supabaseAdmin
            .from('classes')
            .insert([{ class_name, section, academic_year_id, class_teacher_id }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ error: 'Failed to create class' });
    }
};

const getClasses = async (req, res) => {
    try {
        const { academic_year_id } = req.query;

        if (!academic_year_id) {
            return res.status(400).json({ error: 'Academic Year ID is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('classes')
            .select(`
        *,
        class_teacher:faculties (
          id,
          name
        )
      `)
            .eq('academic_year_id', academic_year_id)
            .order('class_name', { ascending: true });

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
};

const getClassById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('classes')
            .select(`
        *,
        class_teacher:faculties (
          id,
          name,
          qualification
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching class:', error);
        res.status(500).json({ error: 'Failed to fetch class' });
    }
};


const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { class_name, section, class_teacher_id } = req.body;

        if (!id) return res.status(400).json({ error: "Class ID required" });

        const { error } = await supabaseAdmin
            .from('classes')
            .update({ class_name, section, class_teacher_id })
            .eq('id', id);

        if (error) {
            if (error.code === '23505') {
                // This handles cases where updating class_name/academic_year_id might violate a unique constraint
                return res.status(409).json({ error: 'Class with this name already exists in this academic year' });
            }
            throw error;
        }

        res.json({ success: true, message: "Class updated successfully" });
    } catch (err) {
        console.error("Update class error:", err);
        res.status(500).json({ error: "Failed to update class" });
    }
}

const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "Class ID required" });

        const { error } = await supabaseAdmin
            .from('classes')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: "Class deleted successfully" });
    } catch (err) {
        console.error("Delete class error:", err);
        res.status(500).json({ error: "Failed to delete class" });
    }
}

module.exports = {
    createClass,
    getClasses,
    getClassById,
    updateClass,
    deleteClass
};
