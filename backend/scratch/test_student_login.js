const { supabase } = require('../src/services/supabaseClient'); // or client
// no node-fetch needed as fetch is global in Node 18+
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function run() {
    const name = "Test Student";
    const dob = "2015-05-15";
    const url = "http://localhost:5000/student/verify";

    console.log(`Verifying student: ${name} with DOB: ${dob}...`);
    
    // Simulate frontend call to /student/verify
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dob })
    });

    const result = await res.json();
    console.log("Verification Response:", result);

    if (res.ok && result.success) {
        console.log("Verification Succeeded! Attempting login with credentials:", result.email, dob);
        const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: result.email,
            password: dob
        });

        if (error) {
            console.error("Login failed:", error.message);
        } else {
            console.log("Login Succeeded! User details:", {
                email: data.user.email,
                role: data.user.user_metadata?.role || data.user.app_metadata?.role
            });
        }
    } else {
        console.error("Verification failed:", result.error);
    }
}

run();
