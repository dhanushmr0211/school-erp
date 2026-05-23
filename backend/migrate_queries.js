const { supabaseAdmin } = require('./src/services/supabaseClient');

async function migrate() {
    const sql = "ALTER TABLE contact_queries ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id);";
    console.log("Running migration...");
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });
    if (error) {
        console.error("Migration failed:", error.message);
        console.log("Please run this SQL manually in Supabase SQL Editor:");
        console.log(sql);
    } else {
        console.log("Migration successful!");
    }
}
migrate();
