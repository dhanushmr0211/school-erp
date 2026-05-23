const { supabaseAdmin } = require('./src/services/supabaseClient');

async function optimize() {
    console.log("Starting DB Optimization...");

    const indexes = [
        "CREATE INDEX IF NOT EXISTS idx_students_academic_year ON students(academic_year_id);",
        "CREATE INDEX IF NOT EXISTS idx_students_name_trgm ON students USING gin (name gin_trgm_ops);",
        "CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);",
        "CREATE INDEX IF NOT EXISTS idx_faculties_academic_year ON faculties(academic_year_id);",
        "CREATE INDEX IF NOT EXISTS idx_enrollments_student ON student_class_enrollments(student_id);",
        "CREATE INDEX IF NOT EXISTS idx_enrollments_class ON student_class_enrollments(class_id);",
        "CREATE INDEX IF NOT EXISTS idx_enrollments_year ON student_class_enrollments(academic_year_id);",
        "CREATE INDEX IF NOT EXISTS idx_marks_student_year ON marks(student_id, academic_year_id);",
        "CREATE INDEX IF NOT EXISTS idx_fees_student_year ON student_fees(student_id, academic_year_id);"
    ];

    for (const sql of indexes) {
        try {
            const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });
            if (error) {
                // If RPC doesn't exist, we might need another way or just report it
                console.log(`Failed to run via RPC: ${sql} - ${error.message}`);
            } else {
                console.log(`Executed: ${sql}`);
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

optimize();