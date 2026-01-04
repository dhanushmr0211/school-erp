const { supabaseAdmin } = require('../services/supabaseClient');

const getStudentMarks = async (req, res) => {
    try {
        const { academic_year_id } = req.query;
        const studentId = req.user.user_metadata?.student_id;

        if (!studentId || !academic_year_id) {
            return res.status(400).json({ error: 'Student ID not found in token or Academic Year ID missing' });
        }

        const { data, error } = await supabaseAdmin
            .from('marks')
            .select(`
                *,
                subject:subjects (
                  id,
                  name
                )
            `)
            .eq('student_id', studentId)
            .eq('academic_year_id', academic_year_id);

        if (error) {
            throw error;
        }

        const normalizedMarks = [];

        data.forEach(record => {
            const subjectName = record.subject?.name || 'Unknown Subject';

            // Helper to add if exists
            const addMark = (val, type, total) => {
                if (val !== null && val !== undefined) {
                    normalizedMarks.push({
                        subject_name: subjectName,
                        exam_type: type,
                        marks_obtained: val,
                        total_marks: total,
                        percentage: ((val / total) * 100).toFixed(2)
                    });
                }
            };

            // Check columns
            addMark(record.test1, 'Test 1', 25);
            addMark(record.test2, 'Test 2', 25);
            addMark(record.sem1, 'Semester 1', 50);
            addMark(record.test3, 'Test 3', 25);
            addMark(record.test4, 'Test 4', 25);
            addMark(record.sem2, 'Semester 2', 50);
        });

        res.json(normalizedMarks);
    } catch (error) {
        console.error('Error fetching student marks:', error);
        res.status(500).json({ error: 'Failed to fetch marks' });
    }
};

const getStudentFees = async (req, res) => {
    try {
        const { academic_year_id } = req.query;
        const studentId = req.user.user_metadata?.student_id;

        if (!studentId || !academic_year_id) {
            return res.status(400).json({ error: 'Student ID not found in token or Academic Year ID missing' });
        }

        const { data, error } = await supabaseAdmin
            .from('student_fees')
            .select('*')
            .eq('student_id', studentId)
            .eq('academic_year_id', academic_year_id)
            .order('semester', { ascending: true });

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching student fees:', error);
        res.status(500).json({ error: 'Failed to fetch student fees' });
    }
};

const getStudentClasses = async (req, res) => {
    try {
        const { academic_year_id } = req.query;
        const studentId = req.user.user_metadata?.student_id;

        if (!studentId || !academic_year_id) {
            return res.status(400).json({ error: 'Student ID or Academic Year ID missing' });
        }

        // 1. Get Class ID for student
        const { data: enrollment, error: enrollError } = await supabaseAdmin
            .from('student_class_enrollments')
            .select('class_id, classes(class_name, section)')
            .eq('student_id', studentId)
            .eq('academic_year_id', academic_year_id)
            .single();

        if (enrollError || !enrollment) {
            return res.json([]); // No class assigned yet
        }

        // 2. Get Subjects/Faculty for that class
        const { data: schedule, error: scheduleError } = await supabaseAdmin
            .from('class_subject_faculty')
            .select(`
                subject:subjects(name, code),
                faculty:faculties(name)
            `)
            .eq('class_id', enrollment.class_id);

        if (scheduleError) throw scheduleError;

        const formatted = schedule.map(item => ({
            subject_name: item.subject?.name,
            subject_code: item.subject?.code,
            faculty_name: item.faculty?.name || 'Not Assigned'
        }));

        res.json({
            class_details: enrollment.classes,
            subjects: formatted
        });

    } catch (error) {
        console.error('Error fetching student classes:', error);
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
};

// --- NEW VERIFICATION FUNCTION ---
const verifyStudent = async (req, res) => {
    try {
        const { admission_number, dob } = req.body;

        if (!admission_number || !dob) {
            return res.status(400).json({ error: "Admission Number and DOB are required" });
        }

        // Query with Service Key (Admin) to bypass RLS
        const { data: student, error } = await supabaseAdmin
            .from('students')
            .select('id, name')
            .eq('admission_number', admission_number)
            .eq('dob', dob)
            .maybeSingle();

        if (error) {
            console.error("Supabase Error:", error);
            return res.status(500).json({ error: "Verification failed due to server error" });
        }

        if (!student) {
            return res.status(404).json({ error: "Invalid Admission Number or Date of Birth" });
        }

        // Construct email
        const effectiveEmail = `student${admission_number}@anikethana.edu`;

        // Auto-Register Auth User if not exists
        try {
            const { error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: effectiveEmail,
                password: dob, // Set DOB as password
                email_confirm: true,
                user_metadata: {
                    role: 'STUDENT',
                    student_id: student.id,
                    name: student.name
                }
            });

            if (createError && !createError.message.includes("already registered")) {
                console.error("Auto-registration failed:", createError);
                // We can arguably fail here, or let them try to login if it was a transient error.
                // But if creation failed really, login will fail too.
            }
        } catch (authErr) {
            console.error("Auth creation exception:", authErr);
        }

        res.json({
            success: true,
            email: effectiveEmail,
            name: student.name
        });

    } catch (err) {
        console.error("Verify Student Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getStudentMarks,
    getStudentFees,
    getStudentClasses,
    verifyStudent
};
