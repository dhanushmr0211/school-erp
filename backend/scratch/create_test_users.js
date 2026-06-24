const { supabaseAdmin } = require('../src/services/supabaseClient');
require('dotenv').config();

async function run() {
    const activeYearId = '917fb684-1adb-4795-a887-eae2a0e08e62'; // 2025-2026
    
    // 1. Create/Update Admin
    const adminEmail = 'testadmin@anikethana.edu';
    console.log("Setting up Admin user...");
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    let adminUser = usersData.users.find(u => u.email === adminEmail);
    if (!adminUser) {
        const { data: res, error } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: 'Admin@1234',
            email_confirm: true,
            user_metadata: { role: 'ADMIN', name: 'Test Admin' }
        });
        if (error) {
            console.error("Admin creation failed:", error);
        } else {
            adminUser = res.user;
        }
    }
    if (adminUser) {
        await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
            password: 'Admin@1234',
            user_metadata: { role: 'ADMIN', name: 'Test Admin' },
            app_metadata: { role: 'ADMIN' }
        });
        console.log("Admin user setup successful.");
    }

    // 2. Create/Update Faculty
    const facultyEmail = 'testfaculty@anikethana.edu';
    console.log("Setting up Faculty user...");
    let facultyUser = usersData.users.find(u => u.email === facultyEmail);
    if (!facultyUser) {
        const { data: res, error } = await supabaseAdmin.auth.admin.createUser({
            email: facultyEmail,
            password: 'Faculty@1234',
            email_confirm: true,
            user_metadata: { role: 'FACULTY', name: 'Test Faculty' }
        });
        if (error) {
            console.error("Faculty creation failed:", error);
        } else {
            facultyUser = res.user;
        }
    }
    if (facultyUser) {
        await supabaseAdmin.auth.admin.updateUserById(facultyUser.id, {
            password: 'Faculty@1234',
            user_metadata: { role: 'FACULTY', name: 'Test Faculty' },
            app_metadata: { role: 'FACULTY' }
        });

        // Upsert into faculties table
        const { data: existingFaculties } = await supabaseAdmin.from('faculties').select('*').eq('email', facultyEmail);
        if (!existingFaculties || existingFaculties.length === 0) {
            const { error: insErr } = await supabaseAdmin.from('faculties').insert({
                user_id: facultyUser.id,
                name: 'Test Faculty',
                email: facultyEmail,
                qualification: 'B.Ed',
                academic_year_id: activeYearId
            });
            if (insErr) console.error("Error inserting faculty record:", insErr);
        }
        console.log("Faculty user setup successful.");
    }

    // 3. Create/Update Student in database
    console.log("Setting up student record...");
    const { data: existingStudents } = await supabaseAdmin.from('students').select('*').eq('name', 'Test Student');
    if (!existingStudents || existingStudents.length === 0) {
        const { data: newStud, error: studErr } = await supabaseAdmin.from('students').insert({
            name: 'Test Student',
            dob: '2015-05-15',
            father_name: 'Father Student',
            mother_name: 'Mother Student',
            academic_year_id: activeYearId,
            admission_number: 9999
        }).select().single();
        if (studErr) {
            console.error("Student insert error:", studErr);
        } else {
            console.log("Student record created:", newStud);
        }
    } else {
        console.log("Student record already exists:", existingStudents[0]);
    }
}

run();
