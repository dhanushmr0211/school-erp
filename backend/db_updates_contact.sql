-- Create the contact_queries table
CREATE TABLE IF NOT EXISTS public.contact_queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    query TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.contact_queries ENABLE ROW LEVEL SECURITY;

-- 1. Allow everyone (anon and authenticated) to INSERT queries
CREATE POLICY "Allow public insert" 
ON public.contact_queries
FOR INSERT 
TO public 
WITH CHECK (true);

-- 2. Allow only Admins to VIEW queries
-- This checks if the user's app_metadata or user_metadata has role = 'ADMIN'
CREATE POLICY "Allow admin view" 
ON public.contact_queries
FOR SELECT 
TO authenticated 
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN' 
    OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
);
