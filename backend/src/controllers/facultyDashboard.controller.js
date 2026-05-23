const { supabaseAdmin } = require('../services/supabaseClient');

const getFacultyClasses = async (req, res) => {
    try {
        const userId = req.user.id;
        const academicYearId = req.academicYearId;

        console.log(`Fetching dashboard for user: ${userId}, Year: ${academicYearId}`);

        // Combined query: Get assignments for the faculty linked to this user_id
        const { data: assignments, error: assignmentError } = await supabaseAdmin
            .from('class_subject_faculty')
            .select(`
                class_id,
                subject_id,
                faculty:faculties!inner (id, user_id),
                classes!inner (
                    id,
                    class_name,
                    section,
                    academic_year_id
                ),
                subjects (
                    id,
                    name,
                    code
                )
            `)
            .eq('faculty.user_id', userId)
            .eq('classes.academic_year_id', academicYearId);

        if (assignmentError) {
            console.error("Assignment Query Error:", assignmentError);
            throw assignmentError;
        }

        if (!assignments || assignments.length === 0) {
            console.log("No assignments found for faculty user:", userId);
        }

        const dashboardData = assignments.map(a => ({
            class_id: a.classes.id,
            class_name: a.classes.class_name,
            section: a.classes.section,
            subject_id: a.subjects.id,
            subject_name: a.subjects.name,
            subject_code: a.subjects.code
        }));

        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching faculty classes:', error);
        res.status(500).json({ error: 'Failed to fetch faculty dashboard data' });
    }
};

module.exports = {
    getFacultyClasses,
};
