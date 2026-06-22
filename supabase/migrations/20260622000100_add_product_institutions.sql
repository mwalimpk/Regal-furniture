CREATE TABLE IF NOT EXISTS public.product_institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID
);

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS institution_slugs TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_product_institutions_status_order
  ON public.product_institutions(status, display_order);

CREATE INDEX IF NOT EXISTS idx_properties_institution_slugs
  ON public.properties USING GIN(institution_slugs);

DROP TRIGGER IF EXISTS update_product_institutions_updated_at ON public.product_institutions;
CREATE TRIGGER update_product_institutions_updated_at
  BEFORE UPDATE ON public.product_institutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.product_institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active product institutions"
  ON public.product_institutions
  FOR SELECT
  USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage product institutions"
  ON public.product_institutions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.product_institutions (name, slug, description, image_url, display_order, status)
VALUES
  ('Government', 'government', 'Durable boardroom, office, storage, and reception furniture for departments, agencies, and public service environments.', '/images/institutions/government.jpg', 1, 'active'),
  ('Hospitals', 'hospitals', 'Practical seating, workstations, storage, and administrative furniture for healthcare teams and patient-facing spaces.', '/images/institutions/hospitals.jpg', 2, 'active'),
  ('Hotels', 'hotels', 'Reception, lounge, back-office, dining, and room-support furniture for hospitality spaces that need comfort and polish.', '/images/institutions/hotels.jpg', 3, 'active'),
  ('Schools', 'schools', 'Furniture for offices, staff rooms, libraries, labs, administration blocks, and flexible learning support areas.', '/images/institutions/schools.jpg', 4, 'active')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;
