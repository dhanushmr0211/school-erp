const { supabaseAdmin } = require('../services/supabaseClient');

const getFacultyClasses = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from Supabase Auth


        console.log("Fetching dashboard for user:", userId);

        // 1. Get Faculty ID
        const { data: faculty, error: facultyError } = await supabaseAdmin
            .from('faculties')
            .select('id')
            .eq('user_id', userId)
            .single();

        console.log("Faculty Lookup result:", faculty, facultyError);

        if (facultyError || !faculty) {
            console.error('Faculty not found for user:', userId, facultyError);
            return res.status(404).json({ error: 'Faculty profile not found' });
        }

        const facultyId = faculty.id;

        const academicYearId = req.academicYearId; // From academicYearGuard

        console.log(`Querying assignments for Faculty: ${facultyId}, Year: ${academicYearId}`);

        // 2. Fetch Class Assignments with Class and Subject details
        const { data: assignments, error: assignmentError } = await supabaseAdmin
            .from('class_subject_faculty')
            .select(`
        class_id,
        subject_id,
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
            .eq('faculty_id', facultyId)
            .eq('classes.academic_year_id', academicYearId);

        console.log("Assignments found:", assignments ? assignments.length : 0);
        if (assignmentError) console.error("Assignment Query Error:", assignmentError);

        if (assignmentError) {
            throw assignmentError;
        }

        // 3. Map to flat list for dashboard
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
