const PDFDocument = require('pdfkit');
const { supabaseAdmin } = require('../services/supabaseClient');

const generateReportCard = async (req, res) => {
    try {
        const { student_id, academic_year_id } = req.query;

        if (!student_id || !academic_year_id) {
            return res.status(400).json({ error: 'Student ID and Academic Year ID are required' });
        }

        // 1. Fetch Student Details
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .select('name, roll_number, father_name, class_enrollments:student_class_enrollments(class:classes(class_name))')
            .eq('id', student_id)
            .eq('student_class_enrollments.academic_year_id', academic_year_id)
            .single();

        if (studentError || !student) {
            console.error('Error fetching student:', studentError);
            return res.status(404).json({ error: 'Student not found' });
        }

        // Extract class name safely (handling potential array or empty results details)
        const className = student.class_enrollments?.[0]?.class?.class_name || 'N/A';

        // 2. Fetch Marks
        const { data: marks, error: marksError } = await supabaseAdmin
            .from('marks')
            .select(`
        marks_obtained,
        max_marks,
        exam_type,
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

        // 3. Calculate Totals
        let sem1Total = 0;
        let sem2Total = 0;
        let totalMaxMarks = 0;
        let totalObtained = 0;

        // We'll prepare rows for the table
        // Format: { subject: 'Math', exam: 'SEM1', obtained: 45, max: 50 }
        const tableRows = marks.map(m => {
            const ob = m.marks_obtained || 0;
            const max = m.max_marks || 0;

            // Calculation logic based on requirements:
            // "SEM1 total (sum of SEM1 marks)"
            // "SEM2 total (sum of SEM2 marks)"
            if (m.exam_type === 'SEM1') {
                sem1Total += ob;
            } else if (m.exam_type === 'SEM2') {
                sem2Total += ob;
            }

            // "Percentage = ((SEM1 + SEM2) / total_max_marks) * 100"
            // Implies we only care about SEM1 and SEM2 for percentage?
            // Or "Total marks" usually implies all marks. 
            // Based on the specific text "Percentage = ((SEM1 + SEM2) / total_max_marks) * 100",
            // I will assume the percentage is derived ONLY from SEM1 and SEM2 exams.
            if (m.exam_type === 'SEM1' || m.exam_type === 'SEM2') {
                totalObtained += ob;
                totalMaxMarks += max;
            }

            return {
                subject: m.subject?.name || 'Unknown',
                exam: m.exam_type,
                obtained: ob,
                max: max
            };
        });

        const percentage = totalMaxMarks > 0 ? ((totalObtained / totalMaxMarks) * 100).toFixed(2) : '0.00';

        // 4. Generate PDF
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report_card_${student.roll_number}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Student Report Card', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`Name: ${student.name}`);
        doc.text(`Roll Number: ${student.roll_number}`);
        doc.text(`Father's Name: ${student.father_name || 'N/A'}`);
        doc.text(`Class: ${className}`);
        doc.moveDown();

        // Table Header
        const tableTop = doc.y;
        const itemX = 50;
        const typeX = 250;
        const marksX = 350;
        const maxX = 450;

        doc.font('Helvetica-Bold');
        doc.text('Subject', itemX, tableTop);
        doc.text('Exam', typeX, tableTop);
        doc.text('Obtained', marksX, tableTop);
        doc.text('Max', maxX, tableTop);
        doc.font('Helvetica');

        doc.moveTo(itemX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Rows
        let y = tableTop + 25;
        tableRows.forEach(row => {
            if (y > 700) { // Add new page if close to bottom
                doc.addPage();
                y = 50;
            }
            doc.text(row.subject, itemX, y);
            doc.text(row.exam, typeX, y);
            doc.text(row.obtained.toString(), marksX, y);
            doc.text(row.max.toString(), maxX, y);
            y += 20;
        });

        doc.moveDown();
        doc.moveTo(itemX, y).lineTo(550, y).stroke();
        y += 10;

        // Summary
        doc.font('Helvetica-Bold');
        doc.text(`SEM1 Total: ${sem1Total}`, itemX, y);
        y += 20;
        doc.text(`SEM2 Total: ${sem2Total}`, itemX, y);
        y += 20;
        doc.text(`Overall Percentage: ${percentage}%`, itemX, y);

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
