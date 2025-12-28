const { supabaseAdmin } = require('../services/supabaseClient');

const upsertMarks = async (req, res) => {
    try {
        const {
            class_id,
            subject_id,
            academic_year_id,
            marks, // Array of { student_id, test1, test2, sem1, ... }
        } = req.body;

        if (!class_id || !subject_id || !academic_year_id || !marks || !Array.isArray(marks)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Allowed columns for security/validation
        // Allowed columns for security/validation
        // 'sem1_percentage' and 'sem2_percentage' are generated columns in DB, so we cannot insert them.
        const allowedColumns = ['test1', 'test2', 'sem1', 'test3', 'test4', 'sem2'];

        const updates = marks.map(m => {
            const updateRow = {
                class_id,
                subject_id,
                academic_year_id,
                student_id: m.student_id
            };

            // Only include valid columns that are present in the input
            allowedColumns.forEach(col => {
                if (m[col] !== undefined) {
                    updateRow[col] = m[col] === "" ? null : m[col];
                }
            });

            return updateRow;
        });

        // process updates sequentially to handle "upsert" manually
        // because the database is missing a unique constraint on (student_id, class_id, subject_id, academic_year_id)
        const results = [];

        for (const update of updates) {
            // 1. Try to Update
            const { data: updatedRows, error: updateError } = await supabaseAdmin
                .from('marks')
                .update(update)
                .eq('student_id', update.student_id)
                .eq('class_id', update.class_id)
                .eq('subject_id', update.subject_id)
                .eq('academic_year_id', update.academic_year_id)
                .select();

            if (updateError) throw updateError;

            if (updatedRows && updatedRows.length > 0) {
                results.push(updatedRows[0]);
            } else {
                // 2. If no update, Insert
                const { data: insertedRow, error: insertError } = await supabaseAdmin
                    .from('marks')
                    .insert(update)
                    .select()
                    .single();

                if (insertError) throw insertError;
                results.push(insertedRow);
            }
        }

        const data = results; // maintain compatibility with response below



        res.status(201).json({ message: 'Marks saved successfully', count: data.length });
    } catch (error) {
        console.error('Error upserting marks:', error);
        res.status(500).json({ error: 'Failed to save marks' });
    }
};

const getMarks = async (req, res) => {
    try {
        const { class_id, subject_id, academic_year_id } = req.query; // Removed exam_type dependency

        if (!class_id || !subject_id || !academic_year_id) {
            return res.status(400).json({ error: 'Missing required query parameters' });
        }

        const { data, error } = await supabaseAdmin
            .from('marks')
            .select(`
                *,
                students (
                  id,
                  name,
                  roll_number
                )
              `)
            .eq('class_id', class_id)
            .eq('subject_id', subject_id)
            .eq('academic_year_id', academic_year_id);

        if (error) throw error;

        // Return raw rows so frontend can access all columns (test1, sem1, etc.)
        const formattedData = data.map(row => ({
            ...row,
            student_name: row.students?.name,
            roll_number: row.students?.roll_number
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching marks:', error);
        res.status(500).json({ error: 'Failed to fetch marks' });
    }
};

module.exports = {
    upsertMarks,
    getMarks,
};
