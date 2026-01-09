const { supabaseAdmin } = require("../services/supabaseClient");

/**
 * POST /admin/faculty-subjects
 * body: { faculty_id, subject_ids: [] }
 */

const assignSubjectToFaculty = async (req, res) => {
    try {
        const { faculty_id, subject_ids } = req.body;

        if (!faculty_id || !Array.isArray(subject_ids)) {
            return res.status(400).json({
                error: "faculty_id and subject_ids (array) are required",
            });
        }

        // 1. Get current subject assignments to identify removed subjects
        const { data: currentAssignments } = await supabaseAdmin
            .from("faculty_subjects")
            .select("subject_id")
            .eq("faculty_id", faculty_id);

        const currentSubjectIds = currentAssignments?.map(a => a.subject_id) || [];
        const removedSubjectIds = currentSubjectIds.filter(id => !subject_ids.includes(id));

        // 2. If subjects are being removed, clean up class_subject_faculty assignments
        if (removedSubjectIds.length > 0) {
            const { error: classCleanupError } = await supabaseAdmin
                .from("class_subject_faculty")
                .delete()
                .eq("faculty_id", faculty_id)
                .in("subject_id", removedSubjectIds);

            if (classCleanupError) {
                console.error("Error cleaning up class assignments:", classCleanupError);
                throw classCleanupError;
            }
        }

        // 3. Delete existing faculty_subjects assignments
        const { error: deleteError } = await supabaseAdmin
            .from("faculty_subjects")
            .delete()
            .eq("faculty_id", faculty_id);

        if (deleteError) throw deleteError;

        // 4. If there are new subjects to assign, insert them
        if (subject_ids.length > 0) {
            const rows = subject_ids.map((subject_id) => ({
                faculty_id,
                subject_id,
            }));

            const { error: insertError } = await supabaseAdmin
                .from("faculty_subjects")
                .insert(rows);

            if (insertError) throw insertError;
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Assign subjects error:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /admin/faculty-subjects?subject_id=UUID
 */
const getFacultiesBySubject = async (req, res) => {
    try {
        const { subject_id } = req.query;

        if (!subject_id) {
            return res.status(400).json({
                error: "subject_id is required",
            });
        }


        const { data, error } = await supabaseAdmin
            .from("faculty_subjects")
            .select(
                `
        faculty:faculties (
          id,
          name,
          email,
          qualification
        )
      `
            )
            .eq("subject_id", subject_id);

        if (error) throw error;

        console.log(`Fetched faculties for subject ${subject_id}:`, JSON.stringify(data, null, 2));

        // Filter out any null faculty objects (in case of broken references)
        const validFaculties = data.map((d) => d.faculty).filter(f => f !== null);

        res.json(validFaculties);
    } catch (err) {
        console.error("Fetch faculties by subject error:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    assignSubjectToFaculty,
    getFacultiesBySubject,
};
