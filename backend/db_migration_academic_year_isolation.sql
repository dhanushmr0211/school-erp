-- Academic Year Isolation Migration Script
-- This script adds academic_year_id to subjects, students, and faculty tables
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. SUBJECTS TABLE
-- ============================================

-- Add academic_year_id column
ALTER TABLE subjects 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_subjects_academic_year ON subjects(academic_year_id);

-- Migrate existing data to current active academic year
UPDATE subjects 
SET academic_year_id = (SELECT id FROM academic_years WHERE is_active = true LIMIT 1)
WHERE academic_year_id IS NULL;

-- Make it required (NOT NULL)
ALTER TABLE subjects ALTER COLUMN academic_year_id SET NOT NULL;

-- ============================================
-- 2. STUDENTS TABLE
-- ============================================

-- Add academic_year_id column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_students_academic_year ON students(academic_year_id);

-- Migrate existing data to current active academic year
UPDATE students 
SET academic_year_id = (SELECT id FROM academic_years WHERE is_active = true LIMIT 1)
WHERE academic_year_id IS NULL;

-- Make it required (NOT NULL)
ALTER TABLE students ALTER COLUMN academic_year_id SET NOT NULL;

-- ============================================
-- 3. FACULTIES TABLE
-- ============================================

-- Add academic_year_id column
ALTER TABLE faculties 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_faculties_academic_year ON faculties(academic_year_id);

-- Migrate existing data to current active academic year
UPDATE faculties 
SET academic_year_id = (SELECT id FROM academic_years WHERE is_active = true LIMIT 1)
WHERE academic_year_id IS NULL;

-- Make it required (NOT NULL)
ALTER TABLE faculties ALTER COLUMN academic_year_id SET NOT NULL;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify subjects have academic_year_id
SELECT COUNT(*) as total_subjects, 
       COUNT(academic_year_id) as subjects_with_year 
FROM subjects;

-- Verify students have academic_year_id
SELECT COUNT(*) as total_students, 
       COUNT(academic_year_id) as students_with_year 
FROM students;

-- Verify faculties have academic_year_id
SELECT COUNT(*) as total_faculty, 
       COUNT(academic_year_id) as faculty_with_year 
FROM faculties;

-- Show distribution by academic year
SELECT ay.year_name, 
       COUNT(DISTINCT s.id) as subjects,
       COUNT(DISTINCT st.id) as students,
       COUNT(DISTINCT f.id) as faculty
FROM academic_years ay
LEFT JOIN subjects s ON s.academic_year_id = ay.id
LEFT JOIN students st ON st.academic_year_id = ay.id
LEFT JOIN faculties f ON f.academic_year_id = ay.id
GROUP BY ay.year_name
ORDER BY ay.year_name;
