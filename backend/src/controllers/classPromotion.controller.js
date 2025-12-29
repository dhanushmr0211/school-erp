const { supabaseAdmin } = require('../services/supabaseClient');

const promoteClass = async (req, res) => {
    try {
        const { source_class_id, target_academic_year_id, new_class_name, new_section } = req.body;

        if (!source_class_id || !target_academic_year_id || !new_class_name) {
            return res.status(400).json({ error: 'Source Class, Target Year, and New Class Name are required' });
        }

        // 1. Create New Class
        const { data: newClass, error: classError } = await supabaseAdmin
            .from('classes')
            .insert([{
                class_name: new_class_name,
                section: new_section || '',
                academic_year_id: target_academic_year_id
            }])
            .select()
            .single();

        if (classError) throw classError;

        const newClassId = newClass.id;

        // 2. Fetch Students from Source Class
        const { data: students, error: studentError } = await supabaseAdmin
            .from('student_class_enrollments')
            .select('student_id, roll_number')
            .eq('class_id', source_class_id);

        if (studentError) throw studentError;

        // 3. Promote Students (Enroll in New Class)
        if (students && students.length > 0) {
            const newEnrollments = students.map(s => ({
                student_id: s.student_id,
                class_id: newClassId,
                academic_year_id: target_academic_year_id,
                roll_number: s.roll_number // Keep same roll number
            }));

            const { error: enrollError } = await supabaseAdmin
                .from('student_class_enrollments')
                .insert(newEnrollments);

            if (enrollError) throw enrollError;
        }

        // 4. Fetch Faculty/Subjects - SKIPPED per user request (Step Id 1775)
        // User wants strictly student promotion only.

        res.status(201).json({ message: 'Class promoted successfully (Students only)', new_class_id: newClassId });

    } catch (error) {
        console.error('Error promoting class:', error);
        res.status(500).json({ error: 'Failed to promote class' });
    }
};

module.exports = {
    promoteClass
};
