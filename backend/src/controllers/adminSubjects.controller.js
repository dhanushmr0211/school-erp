const { supabaseAdmin } = require('../services/supabaseClient');

const getSubjects = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('subjects')
            .select('*')
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

        if (!name || !code || !type) {
            return res.status(400).json({ error: 'Name, code, and type are required' });
        }

        const { data, error } = await supabaseAdmin
            .from('subjects')
            .insert([{ name, code, type }])
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

        if (!id) {
            return res.status(400).json({ error: 'Subject ID is required' });
        }

        const { error } = await supabaseAdmin
            .from('subjects')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: "Subject deleted successfully" });
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
