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
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Subject name is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('subjects')
            .insert([{ name }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({ error: 'Failed to create subject' });
    }
};

module.exports = {
    getSubjects,
    createSubject,
};
