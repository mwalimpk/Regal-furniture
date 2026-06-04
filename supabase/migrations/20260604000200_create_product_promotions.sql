CREATE TABLE IF NOT EXISTS public.product_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  promotion_type TEXT NOT NULL DEFAULT 'single_product',
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(12, 2),
  offer_label TEXT,
  product_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  category_targets JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_product_promotions_status ON public.product_promotions(status);
CREATE INDEX IF NOT EXISTS idx_product_promotions_type ON public.product_promotions(promotion_type);
CREATE INDEX IF NOT EXISTS idx_product_promotions_user_id ON public.product_promotions(user_id);
