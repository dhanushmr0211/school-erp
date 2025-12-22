const { supabaseAdmin } = require('../services/supabaseClient');

const createFaculty = async (req, res) => {
    try {
        const { user_id, name, address, qualification } = req.body;

        if (!user_id || !name) {
            return res.status(400).json({ error: 'User ID and Name are required' });
        }

        const { data, error } = await supabaseAdmin
            .from('faculties')
            .insert([{ user_id, name, address, qualification }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating faculty:', error);
        res.status(500).json({ error: 'Failed to create faculty' });
    }
};

const getFaculties = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('faculties')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

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
          subjects (
            id,
            name
          )
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

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
