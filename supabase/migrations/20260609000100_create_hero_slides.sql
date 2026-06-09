CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow TEXT,
  accent_title TEXT,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  image_alt TEXT,
  cta_label TEXT,
  cta_href TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_status ON public.hero_slides(status);
CREATE INDEX IF NOT EXISTS idx_hero_slides_display_order ON public.hero_slides(display_order);
CREATE INDEX IF NOT EXISTS idx_hero_slides_user_id ON public.hero_slides(user_id);

DROP TRIGGER IF EXISTS update_hero_slides_updated_at ON public.hero_slides;
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active hero slides"
  ON public.hero_slides
  FOR SELECT
  USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage hero slides"
  ON public.hero_slides
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-slides', 'hero-slides', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Hero slide images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'hero-slides');

CREATE POLICY "Authenticated users can upload hero slide images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'hero-slides');

CREATE POLICY "Authenticated users can update hero slide images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'hero-slides');

CREATE POLICY "Authenticated users can delete hero slide images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'hero-slides');
