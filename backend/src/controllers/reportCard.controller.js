const PDFDocument = require('pdfkit');
const { supabaseAdmin } = require('../services/supabaseClient');

const generateReportCard = async (req, res) => {
    try {
        const { admission_number, academic_year_id } = req.query;

        if (!admission_number || !academic_year_id) {
            return res.status(400).json({ error: 'Admission Number and Academic Year ID are required' });
        }

        // 1. Fetch Student Details (lookup by Admission Number)
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .select('id, name, father_name, class_enrollments:student_class_enrollments(roll_number, class:classes(class_name, section))')
            .eq('admission_number', admission_number)
            .eq('student_class_enrollments.academic_year_id', academic_year_id)
            .single();

        if (studentError || !student) {
            console.error('Error fetching student:', studentError);
            return res.status(404).json({ error: 'Student not found with this Admission Number' });
        }

        const student_id = student.id;

        // Extract class details safely
        const enrollment = student.class_enrollments?.[0];
        const classNameRaw = enrollment?.class?.class_name || 'N/A';
        const section = enrollment?.class?.section || '';
        const className = section ? `${classNameRaw} - ${section}` : classNameRaw;
        const rollNumber = enrollment?.roll_number || 'N/A';

        // 2. Fetch Marks
        const { data: marks, error: marksError } = await supabaseAdmin
            .from('marks')
            .select(`
        *,
        subject:subjects (
            name
        )
      `)
            .eq('student_id', student_id)
            .eq('academic_year_id', academic_year_id)
            .order('subject_id', { ascending: true });

        if (marksError) {
            console.error('Error fetching marks:', marksError);
            return res.status(500).json({ error: 'Failed to fetch marks' });
        }

        // 3. Process Marks Data
        let sem1PercentageSum = 0;
        let sem1Count = 0;
        let sem2PercentageSum = 0;
        let sem2Count = 0;

        // Overall for Grand Total (still useful for verification)
        let grandTotalObtained = 0;
        let grandTotalMax = 0;

        const tableRows = marks.map(m => {
            const subjectName = m.subject?.name || 'Unknown';

            const t1 = m.test1;
            const t2 = m.test2;
            const s1 = m.sem1;
            const t3 = m.test3;
            const t4 = m.test4;
            const s2 = m.sem2;

            // Accumulate Percentages directly from DB columns
            if (m.sem1_percentage != null) {
                sem1PercentageSum += m.sem1_percentage;
                sem1Count++;
            }
            if (m.sem2_percentage != null) {
                sem2PercentageSum += m.sem2_percentage;
                sem2Count++;
            }

            // Accumulate Grand Total for Overall Percentage
            // Sem 1 parts
            if (t1 != null) { grandTotalObtained += t1; grandTotalMax += 25; }
            if (t2 != null) { grandTotalObtained += t2; grandTotalMax += 25; }
            if (s1 != null) { grandTotalObtained += s1; grandTotalMax += 50; }
            // Sem 2 parts
            if (t3 != null) { grandTotalObtained += t3; grandTotalMax += 25; }
            if (t4 != null) { grandTotalObtained += t4; grandTotalMax += 25; }
            if (s2 != null) { grandTotalObtained += s2; grandTotalMax += 50; }

            return {
                subject: subjectName,
                test1: t1 ?? '-',
                test2: t2 ?? '-',
                sem1: s1 ?? '-',
                test3: t3 ?? '-',
                test4: t4 ?? '-',
                sem2: s2 ?? '-'
            };
        });

        // Averages
        const sem1Avg = sem1Count > 0 ? (sem1PercentageSum / sem1Count).toFixed(2) : '0.00';
        const sem2Avg = sem2Count > 0 ? (sem2PercentageSum / sem2Count).toFixed(2) : '0.00';

        // Overall
        const overallPercentage = grandTotalMax > 0 ? ((grandTotalObtained / grandTotalMax) * 100).toFixed(2) : '0.00';


        // 4. Generate PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report_card_${rollNumber}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Student Report Card', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`Name: ${student.name}`);
        doc.text(`Roll Number: ${rollNumber}`);
        doc.text(`Father's Name: ${student.father_name || 'N/A'}`);
        doc.text(`Class: ${className}`);
        doc.moveDown();

        // Table Constants
        const tableTop = doc.y;
        const colX = {
            subject: 30,
            test1: 130,
            test2: 180,
            sem1: 230,
            test3: 280,
            test4: 330,
            sem2: 380,
        };

        // Draw Table Header
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('Subject', colX.subject, tableTop);
        doc.text('T1 (25)', colX.test1, tableTop);
        doc.text('T2 (25)', colX.test2, tableTop);
        doc.text('Sem1 (50)', colX.sem1, tableTop);
        doc.text('T3 (25)', colX.test3, tableTop);
        doc.text('T4 (25)', colX.test4, tableTop);
        doc.text('Sem2 (50)', colX.sem2, tableTop);

        doc.moveTo(30, tableTop + 15).lineTo(570, tableTop + 15).stroke();
        doc.font('Helvetica');

        // Draw Table Rows
        let y = tableTop + 25;
        tableRows.forEach(row => {
            if (y > 750) {
                doc.addPage();
                y = 50;
            }
            doc.text(row.subject, colX.subject, y);
            doc.text(row.test1, colX.test1, y);
            doc.text(row.test2, colX.test2, y);
            doc.text(row.sem1, colX.sem1, y);
            doc.text(row.test3, colX.test3, y);
            doc.text(row.test4, colX.test4, y);
            doc.text(row.sem2, colX.sem2, y);

            y += 20;
        });

        doc.moveDown();
        doc.moveTo(30, y).lineTo(570, y).stroke();
        y += 15;

        // Summary
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`Sem 1 Percentage: ${sem1Avg}%`, 30, y);
        y += 20;
        doc.text(`Sem 2 Percentage: ${sem2Avg}%`, 30, y);
        y += 20;
        doc.text(`Overall Percentage: ${overallPercentage}%`, 30, y);

        doc.end();

    } catch (error) {
        console.error('Error generating report card:', error);
        // If headers are already sent (streaming started), we can't send JSON error.
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate report card' });
        }
    }
};

module.exports = {
    generateReportCard,
};
