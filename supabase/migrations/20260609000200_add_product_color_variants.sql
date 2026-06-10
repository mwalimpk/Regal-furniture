ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS color_variants JSONB NOT NULL DEFAULT '[]'::jsonb;
