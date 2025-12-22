const { supabaseAdmin } = require('../services/supabaseClient');

const getFacultyClasses = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from Supabase Auth

        // 1. Get Faculty ID
        const { data: faculty, error: facultyError } = await supabaseAdmin
            .from('faculties')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (facultyError || !faculty) {
            console.error('Faculty not found for user:', userId, facultyError);
            return res.status(404).json({ error: 'Faculty profile not found' });
        }

        const facultyId = faculty.id;

        // 2. Fetch Class Assignments with Class and Subject details
        const { data: assignments, error: assignmentError } = await supabaseAdmin
            .from('class_subject_faculty')
            .select(`
        class_id,
        subject_id,
        classes (
          id,
          class_name,
          academic_year_id
        ),
        subjects (
          id,
          name
        )
      `)
            .eq('faculty_id', facultyId);

        if (assignmentError) {
            throw assignmentError;
        }

        // 3. Process data to group by class and fetch student counts
        const classMap = new Map();

        for (const assignment of assignments) {
            const classId = assignment.class_id;

            if (!classMap.has(classId)) {
                // Fetch student count for this class
                // Note: Doing this in a loop isn't ideal for large datasets but acceptable for typical school loads.
                // A better approach would be a separate aggregation query if Supabase supported it easily in one go.
                const { count, error: countError } = await supabaseAdmin
                    .from('student_class_enrollments')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', classId);

                if (countError) {
                    console.error(`Error counting students for class ${classId}:`, countError);
                }

                classMap.set(classId, {
                    class_id: assignment.classes.id,
                    class_name: assignment.classes.class_name,
                    academic_year_id: assignment.classes.academic_year_id,
                    student_strength: count || 0,
                    subjects: [],
                });
            }

            classMap.get(classId).subjects.push({
                subject_id: assignment.subjects.id,
                subject_name: assignment.subjects.name,
            });
        }

        const dashboardData = Array.from(classMap.values());

        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching faculty classes:', error);
        res.status(500).json({ error: 'Failed to fetch faculty dashboard data' });
    }
};

module.exports = {
    getFacultyClasses,
};
