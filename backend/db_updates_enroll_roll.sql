-- Add roll_number to student_class_enrollments table
ALTER TABLE student_class_enrollments ADD COLUMN IF NOT EXISTS roll_number INTEGER;
