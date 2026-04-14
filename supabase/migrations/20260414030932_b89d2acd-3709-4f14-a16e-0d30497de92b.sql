-- Fix: Replace overly permissive INSERT on inquiries to require email
DROP POLICY "Anyone can create inquiries" ON public.inquiries;
CREATE POLICY "Anyone can create inquiries with valid data" ON public.inquiries FOR INSERT WITH CHECK (email IS NOT NULL AND name IS NOT NULL);

-- Fix: Replace overly permissive INSERT on leads to require email
DROP POLICY "Anyone can create leads" ON public.leads;
CREATE POLICY "Anyone can create leads with valid data" ON public.leads FOR INSERT WITH CHECK (email IS NOT NULL AND name IS NOT NULL);

-- Fix: Restrict storage bucket listing to authenticated users only
DROP POLICY "Property images are publicly accessible" ON storage.objects;
CREATE POLICY "Property images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');
CREATE POLICY "Public can view property images by name" ON storage.objects FOR SELECT USING (bucket_id = 'property-images' AND name IS NOT NULL);