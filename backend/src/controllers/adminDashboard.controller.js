const { supabaseAdmin } = require('../services/supabaseClient');

const getDashboardStats = async (req, res) => {
    try {
        const academicYearId = req.headers['x-academic-year'] || req.query.academic_year_id;

        if (!academicYearId) {
            return res.status(400).json({ error: 'Academic Year ID is required' });
        }

        // Parallel count queries using count: 'exact', head: true for performance
        const [
            { count: studentCount, error: studentError },
            { count: classCount, error: classError },
            { count: facultyCount, error: facultyError }
        ] = await Promise.all([
            supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).eq('academic_year_id', academicYearId),
            supabaseAdmin.from('classes').select('*', { count: 'exact', head: true }).eq('academic_year_id', academicYearId),
            supabaseAdmin.from('faculties').select('*', { count: 'exact', head: true })
        ]);

        if (studentError) throw studentError;
        if (classError) throw classError;
        if (facultyError) throw facultyError;

        res.json({
            students: studentCount || 0,
            classes: classCount || 0,
            faculty: facultyCount || 0
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

module.exports = { getDashboardStats };
