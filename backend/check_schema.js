const { supabaseAdmin } = require('./src/services/supabaseClient');
require('dotenv').config();

async function checkSchema() {
    try {
        console.log("Checking schema for 'marks' table...");

        // Try to insert a dummy record to see errors? No, safer to just select logic.
        // Actually, we can assume public schema.

        // This query works on Postgres to list columns
        const { data, error } = await supabaseAdmin
            .rpc('get_columns', { table_name: 'marks' });
        // Warning: rpc might not exist if we didn't create it.

        // Alternative: Just try to select * limit 1
        const { data: rows, error: selectError } = await supabaseAdmin
            .from('marks')
            .select('*')
            .limit(1);

        if (selectError) {
            console.error("Select Error:", selectError);
        } else {
            console.log("Select Success. Row keys:", rows.length > 0 ? Object.keys(rows[0]) : "No rows found");
        }

    } catch (err) {
        console.error("Script Error:", err);
    }
}

checkSchema();
