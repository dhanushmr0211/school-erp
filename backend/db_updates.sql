-- Run this in your Supabase SQL Editor to add the missing columns

ALTER TABLE subjects 
ADD COLUMN code text,
ADD COLUMN type text DEFAULT 'THEORY';
