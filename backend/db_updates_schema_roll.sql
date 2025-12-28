-- Make roll_number nullable in students table
ALTER TABLE students ALTER COLUMN roll_number DROP NOT NULL;
