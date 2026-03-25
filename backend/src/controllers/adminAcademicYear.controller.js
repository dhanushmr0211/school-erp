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
        res.status(500).json({ error: 'Failed to fetch academic years: ' + (error.message || JSON.stringify(error)) });
    }
};

const createAcademicYear = async (req, res) => {
    try {
        const { year_name, start_date, end_date } = req.body;

        if (!year_name) {
            return res.status(400).json({ error: 'Year name is required' });
        }

        // 1. Create the new academic year
        const { data: newYear, error: yearError } = await supabaseAdmin
            .from('academic_years')
            .insert([{ year_name, start_date, end_date, is_active: false }])
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

            const { data: oldFaculty } = await supabaseAdmin
                .from('faculties')
                .select('name, email, user_id, qualification')
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

const activateAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Deactivate all years
        const { error: deactivateError } = await supabaseAdmin
            .from('academic_years')
            .update({ is_active: false })
            .neq('id', id);

        if (deactivateError) throw deactivateError;

        // 2. Activate the selected year
        const { data, error: activateError } = await supabaseAdmin
            .from('academic_years')
            .update({ is_active: true })
            .eq('id', id)
            .select()
            .single();

        if (activateError) throw activateError;

        res.json(data);
    } catch (error) {
        console.error('Error activating academic year:', error);
        res.status(500).json({ error: 'Failed to activate academic year' });
    }
};

const syncAcademicYearData = async (req, res) => {
    try {
        const { from_year_id, to_year_id } = req.body;

        if (!from_year_id || !to_year_id) {
            return res.status(400).json({ error: 'Source and target year IDs are required' });
        }

        console.log(`Syncing data from ${from_year_id} to ${to_year_id}`);

        // 1. Copy subjects (Skip if name already exists in target)
        const { data: oldSubjects } = await supabaseAdmin
            .from('subjects')
            .select('name, code, type')
            .eq('academic_year_id', from_year_id);

        if (oldSubjects && oldSubjects.length > 0) {
            // Get existing subjects in target year
            const { data: targetSubjects } = await supabaseAdmin
                .from('subjects')
                .select('name')
                .eq('academic_year_id', to_year_id);
            const targetSubjectNames = new Set(targetSubjects?.map(s => s.name) || []);

            const newSubjects = oldSubjects
                .filter(s => !targetSubjectNames.has(s.name))
                .map(s => ({ ...s, academic_year_id: to_year_id }));

            if (newSubjects.length > 0) {
                const { error } = await supabaseAdmin.from('subjects').insert(newSubjects);
                if (error) console.error("Subject sync error:", error.message);
            }
        }

        // 2. Copy faculty (Skip if user_id already exists in target)
        const { data: oldFaculty } = await supabaseAdmin
            .from('faculties')
            .select('name, email, user_id, qualification')
            .eq('academic_year_id', from_year_id);

        if (oldFaculty && oldFaculty.length > 0) {
            // Get existing faculty in target
            const { data: targetFaculty } = await supabaseAdmin
                .from('faculties')
                .select('user_id')
                .eq('academic_year_id', to_year_id);
            const targetUserIds = new Set(targetFaculty?.map(f => f.user_id) || []);

            const newFaculty = oldFaculty
                .filter(f => !targetUserIds.has(f.user_id))
                .map(f => ({ ...f, academic_year_id: to_year_id }));

            if (newFaculty.length > 0) {
                const { error } = await supabaseAdmin.from('faculties').insert(newFaculty);
                if (error) console.error("Faculty sync error:", error.message);
            }
        }

        // 3. Copy students (Deduplicate by admission_number)
        const { data: oldStudents } = await supabaseAdmin
            .from('students')
            .select('admission_number, dob, name, father_name, mother_name, father_occupation, mother_occupation, address, contact, registered_date, roll_number')
            .eq('academic_year_id', from_year_id);

        if (oldStudents && oldStudents.length > 0) {
            const { data: targetStudents } = await supabaseAdmin
                .from('students')
                .select('admission_number')
                .eq('academic_year_id', to_year_id);
            const targetAdmissionNumbers = new Set(targetStudents?.map(s => s.admission_number) || []);

            const newStudents = oldStudents
                .filter(s => !targetAdmissionNumbers.has(s.admission_number))
                .map(s => ({ ...s, academic_year_id: to_year_id }));

            if (newStudents.length > 0) {
                const { error } = await supabaseAdmin.from('students').insert(newStudents);
                if (error) console.error("Student sync error:", error.message);
            }
        }

        res.json({ success: true, message: 'Data synced successfully (Duplicates avoided)' });
    } catch (error) {
        console.error('Error syncing academic year data:', error);
        res.status(500).json({ error: 'Failed to sync academic year data' });
    }
};

module.exports = {
    getAcademicYears,
    createAcademicYear,
    activateAcademicYear,
    syncAcademicYearData,
};
