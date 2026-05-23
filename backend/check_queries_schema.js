const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from('contact_queries').select('*').limit(1);
    if (error) console.error(error);
    else console.log('Columns:', data.length > 0 ? Object.keys(data[0]) : 'Empty table');
}
check();
