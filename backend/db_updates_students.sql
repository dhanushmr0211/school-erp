-- Add registered_date to students table
ALTER TABLE students 
ADD COLUMN registered_date date DEFAULT CURRENT_DATE;
