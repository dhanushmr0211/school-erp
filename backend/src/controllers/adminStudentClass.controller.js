const { supabaseAdmin } = require('../services/supabaseClient');


const enrollStudentsToClass = async (req, res) => {
    try {
        const { class_id, academic_year_id, student_ids } = req.body;

        if (!class_id || !academic_year_id || !student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
            return res.status(400).json({ error: 'Class ID, Academic Year ID, and a list of Student IDs are required' });
        }

        // 1. Fetch ALL currently enrolled students for this class
        const { data: existingEnrollments, error: fetchError } = await supabaseAdmin
            .from('student_class_enrollments')
            .select('student_id, students(id, name)')
            .eq('class_id', class_id);

        if (fetchError) throw fetchError;

        // 2. Combine existing and new student IDs
        const existingStudentIds = existingEnrollments.map(e => e.student_id);

        // Filter out any duplicates just in case
        const newStudentIds = student_ids.filter(id => !existingStudentIds.includes(id));
        const allStudentIds = [...existingStudentIds, ...newStudentIds];

        if (allStudentIds.length === 0) {
            return res.json({ message: "No students to enroll" });
        }

        // 3. Fetch names for ALL involved students to sort them
        const { data: allStudents, error: studentError } = await supabaseAdmin
            .from('students')
            .select('id, name')
            .in('id', allStudentIds);

        if (studentError) throw studentError;

        // 4. Sort students alphabetically by name
        allStudents.sort((a, b) => a.name.localeCompare(b.name));


        // 5. Prepare data with sequential roll numbers
        const updates = allStudents.map((student, index) => ({
            class_id,
            academic_year_id,
            student_id: student.id,
            roll_number: index + 1
        }));

        // 6. Update student_class_enrollments with new roll numbers
        // We need to iterate because we are updating specific rows with specific values
        for (const update of updates) {
            // Check if enrollment exists to decide insert vs update?
            // Actually, we can just upsert if we have constraints, or check logic.
            // Simplified: 
            // 1. If student was already enrolled, update their roll_number.
            // 2. If student is NEW, insert them with roll_number.

            // We can try to UPDATE first. If no match (rows modified = 0), then INSERT.
            // OR use Supabase `upsert` if we have a unique constraint on (class_id, student_id).
            // Assuming (class_id, student_id) is unique (it should be).


            // Manually check if enrollment exists for this student in this ACADEMIC YEAR (regardless of class)
            // Because a student can only be in one class per year.
            const { data: existing, error: findError } = await supabaseAdmin
                .from('student_class_enrollments')
                .select('id')
                .eq('student_id', update.student_id)
                .eq('academic_year_id', update.academic_year_id)
                .single();

            // Ignore "Row not found" error from .single()
            if (findError && findError.code !== 'PGRST116') throw findError;

            if (existing) {
                // UPDATE existing enrollment (effectively moves student to this class if they were in another)
                const { error: updateError } = await supabaseAdmin
                    .from('student_class_enrollments')
                    .update({
                        class_id: update.class_id, // Ensure they are in THIS class
                        roll_number: update.roll_number
                    })
                    .eq('id', existing.id);

                if (updateError) throw updateError;
            } else {
                // INSERT new enrollment
                const { error: insertError } = await supabaseAdmin
                    .from('student_class_enrollments')
                    .insert({
                        class_id: update.class_id,
                        academic_year_id: update.academic_year_id,
                        student_id: update.student_id,
                        roll_number: update.roll_number
                    });

                if (insertError) throw insertError;
            }
        }

        res.status(201).json({ message: "Students enrolled and roll numbers reassigned successfully" });

    } catch (error) {
        console.error('Error enrolling students:', error);
        res.status(500).json({ error: 'Failed to enroll students' });
    }
};

const getClassStudents = async (req, res) => {
    try {
        const { class_id } = req.query;

        if (!class_id) {
            return res.status(400).json({ error: 'Class ID is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('student_class_enrollments')
            .select(`
                student_id,
                roll_number,
                students (
                  id,
                  name
                )
            `)
            .eq('class_id', class_id)
            .order('roll_number', { ascending: true }); // Sort by roll number

        if (error) {
            throw error;
        }

        // Flatten logic if desired, but returning as is maintains structure
        res.json(data);
    } catch (error) {
        console.error('Error fetching class students:', error);
        res.status(500).json({ error: 'Failed to fetch class students' });
    }
};

const removeStudentFromClass = async (req, res) => {
    try {
        const { class_id, student_id } = req.params;

        if (!class_id || !student_id) {
            return res.status(400).json({ error: 'Class ID and Student ID are required' });
        }

        const { error } = await supabaseAdmin
            .from('student_class_enrollments')
            .delete()
            .match({ class_id, student_id });

        if (error) throw error;

        res.json({ message: 'Student removed from class successfully' });
    } catch (error) {
        console.error('Error removing student from class:', error);
        res.status(500).json({ error: 'Failed to remove student from class' });
    }
};

module.exports = {
    enrollStudentsToClass,
    getClassStudents,
    removeStudentFromClass
};
