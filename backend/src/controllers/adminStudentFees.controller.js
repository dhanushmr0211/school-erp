const { supabaseAdmin } = require('../services/supabaseClient');

const upsertStudentFees = async (req, res) => {
    try {
        const {
            student_id,
            academic_year_id,
            semester,
            tuition_total, tuition_paid,
            books_total, books_paid,
            uniform_total, uniform_paid,
            bus_total, bus_paid
        } = req.body;

        if (!student_id || !academic_year_id || !semester) {
            return res.status(400).json({ error: 'Student ID, Academic Year ID, and Semester are required' });
        }

        // Helper to parse numbers safely
        const val = (v) => Number(v) || 0;

        const tt = val(tuition_total);
        const tp = val(tuition_paid);
        const bt = val(books_total);
        const bp = val(books_paid);
        const ut = val(uniform_total);
        const up = val(uniform_paid);
        const bust = val(bus_total);
        const busp = val(bus_paid);

        const total_fee = tt + bt + ut + bust;
        const total_paid = tp + bp + up + busp;
        const balance_fee = total_fee - total_paid;

        const feeData = {
            student_id,
            academic_year_id,
            semester,
            tuition_total: tt,
            tuition_paid: tp,
            books_total: bt,
            books_paid: bp,
            uniform_total: ut,
            uniform_paid: up,
            bus_total: bust,
            bus_paid: busp
        };

        const { data, error } = await supabaseAdmin
            .from('student_fees')
            .upsert(feeData, { onConflict: 'student_id, academic_year_id, semester' })
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error upserting student fees:', error);
        res.status(500).json({ error: 'Failed to save student fees' });
    }
};

const getStudentFees = async (req, res) => {
    try {
        const { student_id, academic_year_id } = req.query;

        if (!student_id || !academic_year_id) {
            return res.status(400).json({ error: 'Student ID and Academic Year ID are required' });
        }

        const { data, error } = await supabaseAdmin
            .from('student_fees')
            .select('*')
            .eq('student_id', student_id)
            .eq('academic_year_id', academic_year_id)
            .order('semester', { ascending: true }); // Order by semester

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching student fees:', error);
        res.status(500).json({ error: 'Failed to fetch student fees' });
    }
};

module.exports = {
    upsertStudentFees,
    getStudentFees,
};
