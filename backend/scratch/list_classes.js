const { supabaseAdmin } = require('../src/services/supabaseClient');
require('dotenv').config();

async function run() {
    console.log("CLASSES:");
    const { data, error } = await supabaseAdmin.from('classes').select('*');
    if (error) console.error(error);
    else console.log(data);
}
run();
