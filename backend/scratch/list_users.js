const { supabaseAdmin } = require('../src/services/supabaseClient');
require('dotenv').config();

async function run() {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
        console.error(error);
        return;
    }
    console.log("USERS:");
    data.users.forEach(u => {
        console.log(`Email: ${u.email}, Role in metadata: ${u.user_metadata?.role}, Role in app_metadata: ${u.app_metadata?.role}`);
    });
}
run();
