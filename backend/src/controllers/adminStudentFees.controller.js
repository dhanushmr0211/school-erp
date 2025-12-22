const { supabaseAdmin } = require('../services/supabaseClient');

const upsertStudentFees = async (req, res) => {
    try {
        const {
            student_id,
            academic_year_id,
            semester,
            tuition_fee,
            book_fee,
            uniform_fee,
            bus_fee,
            fee_paid,
        } = req.body;

        if (!student_id || !academic_year_id || !semester) {
            return res.status(400).json({ error: 'Student ID, Academic Year ID, and Semester are required' });
        }

        // Default fees to 0 if not provided
        const tf = Number(tuition_fee) || 0;
        const bf = Number(book_fee) || 0;
        const uf = Number(uniform_fee) || 0;
        const buf = Number(bus_fee) || 0;
        const fp = Number(fee_paid) || 0;

        const total_fee = tf + bf + uf + buf;
        const fee_balance = total_fee - fp;

        // Prepare data for upsert
        // We assume there is a unique constraint on (student_id, academic_year_id, semester)
        // or the frontend is sending an 'id' which we are not explicitly reading here.
        // If relying on composite uniqueness, upsert works fine.
        const feeData = {
            student_id,
            academic_year_id,
            semester,
            tuition_fee: tf,
            book_fee: bf,
            uniform_fee: uf,
            bus_fee: buf,
            total_fee,
            fee_paid: fp,
            fee_balance,
        };

        const { data, error } = await supabaseAdmin
            .from('student_fees')
            .upsert(feeData)
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
            .eq('academic_year_id', academic_year_id);

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
