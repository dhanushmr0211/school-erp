const { supabaseAdmin } = require('../src/services/supabaseClient');
require('dotenv').config();

async function run() {
    console.log("ACADEMIC YEARS:");
    const { data: years } = await supabaseAdmin.from('academic_years').select('*');
    console.log(years);

    console.log("ALL STUDENTS:");
    const { data: students } = await supabaseAdmin.from('students').select('*');
    console.log(students);
}
run();
