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

        // 1. Create the new academic year
        const { data: newYear, error: yearError } = await supabaseAdmin
            .from('academic_years')
            .insert([{ year_name, is_active: false }])
            .select()
            .single();

        if (yearError) {
            throw yearError;
        }

        // 2. Get the currently active academic year
        const { data: activeYear } = await supabaseAdmin
            .from('academic_years')
            .select('id')
            .eq('is_active', true)
            .single();

        if (activeYear) {
            console.log(`Copying data from academic year ${activeYear.id} to ${newYear.id}`);

            // 3. Copy subjects
            const { data: oldSubjects } = await supabaseAdmin
                .from('subjects')
                .select('name, code, type')
                .eq('academic_year_id', activeYear.id);

            if (oldSubjects && oldSubjects.length > 0) {
                const newSubjects = oldSubjects.map(s => ({
                    ...s,
                    academic_year_id: newYear.id
                }));

                const { error: subjectsError } = await supabaseAdmin
                    .from('subjects')
                    .insert(newSubjects);

                if (subjectsError) {
                    console.error('Error copying subjects:', subjectsError);
                }
            }

            // 4. Copy faculty
            const { data: oldFaculty } = await supabaseAdmin
                .from('faculties')
                .select('name, email, user_id')
                .eq('academic_year_id', activeYear.id);

            if (oldFaculty && oldFaculty.length > 0) {
                const newFaculty = oldFaculty.map(f => ({
                    ...f,
                    academic_year_id: newYear.id
                }));

                const { error: facultyError } = await supabaseAdmin
                    .from('faculties')
                    .insert(newFaculty);

                if (facultyError) {
                    console.error('Error copying faculty:', facultyError);
                }
            }

            // 5. Copy students
            const { data: oldStudents } = await supabaseAdmin
                .from('students')
                .select('admission_number, dob, name, father_name, mother_name, father_occupation, mother_occupation, address, contact, registered_date, roll_number')
                .eq('academic_year_id', activeYear.id);

            if (oldStudents && oldStudents.length > 0) {
                const newStudents = oldStudents.map(s => ({
                    ...s,
                    academic_year_id: newYear.id
                }));

                const { error: studentsError } = await supabaseAdmin
                    .from('students')
                    .insert(newStudents);

                if (studentsError) {
                    console.error('Error copying students:', studentsError);
                }
            }

            console.log('Data copy completed successfully');
        }

        res.status(201).json(newYear);
    } catch (error) {
        console.error('Error creating academic year:', error);
        res.status(500).json({ error: 'Failed to create academic year' });
    }
};

module.exports = {
    getAcademicYears,
    createAcademicYear,
};
