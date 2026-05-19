-- Schema for Admin Product Configurations
-- Since products are hardcoded, we only need to store relationships and arrays of IDs.

-- Create table to store 'You May Also Like' pairings
CREATE TABLE IF NOT EXISTS public.product_pairings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL UNIQUE,
    recommended_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Create table to store global manually 'Featured' products for the homepage
CREATE TABLE IF NOT EXISTS public.featured_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    featured_group TEXT UNIQUE NOT NULL, -- e.g. 'homepage_bestsellers'
    product_ids TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.product_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public Read Access for Pairings" ON public.product_pairings FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Featured" ON public.featured_products FOR SELECT USING (true);

-- Allow authenticated users with 'admin' role to manage
-- Note: Assuming you have a user_roles table or similar that defines who is admin. 
-- For simplicity, if ONLY admins can access your app's dashboard, you can just allow auth users to edit:
CREATE POLICY "Auth Edit Pairings" ON public.product_pairings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Edit Featured" ON public.featured_products FOR ALL USING (auth.role() = 'authenticated');
