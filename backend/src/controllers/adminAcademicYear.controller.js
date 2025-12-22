const { supabaseAdmin } = require('../services/supabaseClient');

const getAcademicYears = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('academic_years')
            .select('*')
            .order('year_name', { ascending: true });

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching academic years:', error);
        res.status(500).json({ error: 'Failed to fetch academic years' });
    }
};

const createAcademicYear = async (req, res) => {
    try {
        const { year_name } = req.body;

        if (!year_name) {
            return res.status(400).json({ error: 'Year name is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('academic_years')
            .insert([{ year_name }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating academic year:', error);
        res.status(500).json({ error: 'Failed to create academic year' });
    }
};

module.exports = {
    getAcademicYears,
    createAcademicYear,
};
