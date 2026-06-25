const { supabaseAdmin } = require('./src/services/supabaseClient');

async function getTestUsers() {
    try {
        console.log("=== Auth Users ===");
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw authError;

        for (const u of users) {
            console.log(`Email: ${u.email}, ID: ${u.id}, Role: ${u.app_metadata?.role || u.user_metadata?.role}`);
        }

        console.log("\n=== Faculty ===");
        const { data: faculties, error: facError } = await supabaseAdmin.from('faculties').select('id, name, email');
        if (facError) throw facError;
        console.log(faculties);

        console.log("\n=== Students ===");
        const { data: students, error: studError } = await supabaseAdmin.from('students').select('id, name, dob, email');
        if (studError) throw studError;
        console.log(students.slice(0, 5));
    } catch (err) {
        console.error(err);
    }
}

getTestUsers();
