const PDFDocument = require('pdfkit');
const { supabaseAdmin } = require('../services/supabaseClient');

const generateReportCard = async (req, res) => {
    try {
        const { admission_number, academic_year_id } = req.query;

        if (!admission_number || !academic_year_id) {
            return res.status(400).json({ error: 'Admission Number and Academic Year ID are required' });
        }

        // 1. Fetch Student Details (lookup by Admission Number + Academic Year)
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .select('id, name, father_name, class_enrollments:student_class_enrollments(roll_number, class:classes(class_name, section))')
            .eq('admission_number', admission_number)
            .eq('academic_year_id', academic_year_id)
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

        // Fetch academic year name
        const { data: yearData } = await supabaseAdmin
            .from('academic_years')
            .select('year_name')
            .eq('id', academic_year_id)
            .single();
        const academicYearName = yearData?.year_name || '';

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

        marks.forEach(m => {
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
        });

        // Unique subjects and map for rendering table
        const subjects = [];
        const subjectMap = {};
        marks.forEach(m => {
            const subName = m.subject?.name || 'Unknown';
            if (!subjects.includes(subName)) {
                subjects.push(subName);
            }
            subjectMap[subName] = m;
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

        // ===== SCHOOL LETTERHEAD =====
        // Try to load logo from multiple locations
        const path = require('path');
        const fs = require('fs');
        const logoPaths = [
            path.join(__dirname, '../../public/logo.png'),
            path.join(__dirname, '../../../frontend/public/logo.png'),
        ];
        const logoPath = logoPaths.find(p => fs.existsSync(p));

        if (logoPath) {
            doc.image(logoPath, 460, 25, { width: 80 });
        }

        // School Name & Details (left side)
        doc.fontSize(18).font('Helvetica-Bold').text('ANIKETHANA EDUCATION SOCIETY', 30, 30, { width: 420 });
        doc.fontSize(9).font('Helvetica')
            .text('English Medium School | Estd. 2010', 30, 52, { width: 420 })
            .text('Kadur Road, 9th Cross, Chikkamagaluru, Karnataka - 577138', 30, 64, { width: 420 })
            .text('Phone: +91 74112 91438  |  Email: aesanikethanaschool@gmail.com', 30, 76, { width: 420 });

        // Divider line
        doc.moveTo(30, 100).lineTo(570, 100).lineWidth(1.5).stroke();

        // Report Card Title
        doc.y = 115;
        doc.fontSize(14).font('Helvetica-Bold').text('STUDENT REPORT CARD', { align: 'center' });
        doc.fontSize(10).font('Helvetica').text(`Academic Year: ${academicYearName}`, { align: 'center' });
        doc.moveDown(0.5);

        // Divider
        doc.moveTo(30, doc.y).lineTo(570, doc.y).lineWidth(0.5).stroke();
        doc.moveDown(0.5);

        // Student Info Grid
        const infoY = doc.y;
        doc.fontSize(10).font('Helvetica');
        doc.text(`Name: `, 30, infoY, { continued: true }).font('Helvetica-Bold').text(student.name);
        doc.font('Helvetica').text(`Father's Name: `, 300, infoY, { continued: true }).font('Helvetica-Bold').text(student.father_name || 'N/A');

        doc.font('Helvetica').text(`Admission No: `, 30, infoY + 18, { continued: true }).font('Helvetica-Bold').text(admission_number);
        doc.font('Helvetica').text(`Roll Number: `, 300, infoY + 18, { continued: true }).font('Helvetica-Bold').text(rollNumber);

        doc.font('Helvetica').text(`Class: `, 30, infoY + 36, { continued: true }).font('Helvetica-Bold').text(className);

        doc.y = infoY + 60;
        doc.moveDown(0.5);

        // Table Constants
        const startX = 30;
        const endX = 570;
        const totalWidth = endX - startX; // 540
        const testColWidth = 80;
        const totalColWidth = 75;
        const resultColWidth = 55;
        const subjectColsWidth = totalWidth - testColWidth - totalColWidth - resultColWidth; // 330
        const numSubjects = subjects.length || 1;
        const subjectColWidth = subjectColsWidth / numSubjects;

        let fSize = 10;
        if (numSubjects > 5) {
            fSize = 8;
        } else if (numSubjects > 4) {
            fSize = 9;
        }

        const tableTop = doc.y;

        // Draw Table Header
        doc.font('Helvetica-Bold').fontSize(fSize).fillColor('#000000');
        doc.text('Test', startX, tableTop, { width: testColWidth, align: 'left' });
        
        subjects.forEach((sub, i) => {
            const x = startX + testColWidth + i * subjectColWidth;
            doc.text(sub, x, tableTop, { width: subjectColWidth, align: 'center' });
        });
        
        doc.text('Total Marks', endX - totalColWidth - resultColWidth, tableTop, { width: totalColWidth, align: 'center' });
        doc.text('Result', endX - resultColWidth, tableTop, { width: resultColWidth, align: 'center' });

        doc.moveTo(startX, tableTop + 15).lineTo(endX, tableTop + 15).lineWidth(0.5).stroke();

        const testConfigs = [
            { key: 'test1', label: 'T1 (25)', max: 25 },
            { key: 'test2', label: 'T2 (25)', max: 25 },
            { key: 'sem1', label: 'Sem 1 (50)', max: 50 },
            { key: 'test3', label: 'T3 (25)', max: 25 },
            { key: 'test4', label: 'T4 (25)', max: 25 },
            { key: 'sem2', label: 'Sem 2 (50)', max: 50 }
        ];

        let y = tableTop + 25;
        testConfigs.forEach(config => {
            if (y > 750) {
                doc.addPage();
                y = 50;
            }

            // Gather scores and check pass/fail
            let totalObtained = 0;
            let hasAnyMark = false;
            let anyFailed = false;

            const rowMarks = {};
            subjects.forEach(sub => {
                const markRec = subjectMap[sub];
                const score = markRec ? markRec[config.key] : null;
                rowMarks[sub] = score;

                if (score != null) {
                    hasAnyMark = true;
                    totalObtained += score;
                    // Pass is >= 35% of max marks
                    const passThreshold = config.max * 0.35;
                    if (score < passThreshold) {
                        anyFailed = true;
                    }
                }
            });

            const resultText = hasAnyMark ? (anyFailed ? 'FAIL' : 'PASS') : '-';
            const totalText = hasAnyMark ? totalObtained.toString() : '-';

            // Print Test Label (red if any failed, else black)
            doc.font('Helvetica-Bold').fontSize(fSize);
            if (anyFailed) {
                doc.fillColor('#dc2626');
            } else {
                doc.fillColor('#000000');
            }
            doc.text(config.label, startX, y, { width: testColWidth, align: 'left' });

            // Print Subject Marks
            subjects.forEach((sub, i) => {
                const x = startX + testColWidth + i * subjectColWidth;
                const score = rowMarks[sub];
                const scoreText = score != null ? score.toString() : '-';

                if (score != null && score < config.max * 0.35) {
                    doc.fillColor('#dc2626').font('Helvetica-Bold');
                } else {
                    doc.fillColor('#000000').font('Helvetica');
                }
                doc.text(scoreText, x, y, { width: subjectColWidth, align: 'center' });
            });

            // Print Total Marks (black)
            doc.fillColor('#000000').font('Helvetica');
            doc.text(totalText, endX - totalColWidth - resultColWidth, y, { width: totalColWidth, align: 'center' });

            // Print Result (red if failed, else black)
            if (anyFailed) {
                doc.fillColor('#dc2626').font('Helvetica-Bold');
            } else {
                doc.fillColor('#000000').font('Helvetica');
            }
            doc.text(resultText, endX - resultColWidth, y, { width: resultColWidth, align: 'center' });

            y += 20;
        });

        // Restore default color
        doc.fillColor('#000000');

        doc.moveTo(startX, y).lineTo(endX, y).lineWidth(0.5).stroke();
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
