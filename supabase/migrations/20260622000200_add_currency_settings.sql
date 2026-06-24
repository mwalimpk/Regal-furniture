CREATE TABLE IF NOT EXISTS public.currency_settings (
  id TEXT PRIMARY KEY,
  auto_update BOOLEAN NOT NULL DEFAULT true,
  manual_rate NUMERIC NOT NULL DEFAULT 27,
  fallback_rate NUMERIC NOT NULL DEFAULT 27,
  profit_margin_enabled BOOLEAN NOT NULL DEFAULT false,
  profit_margin_usd NUMERIC NOT NULL DEFAULT 0,
  cache_hours INTEGER NOT NULL DEFAULT 24,
  rate_source_url TEXT NOT NULL DEFAULT 'https://open.er-api.com/v6/latest/USD',
  last_live_rate NUMERIC,
  last_rate_updated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID
);

ALTER TABLE public.currency_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view currency settings"
  ON public.currency_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage currency settings"
  ON public.currency_settings
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.currency_settings (
  id,
  auto_update,
  manual_rate,
  fallback_rate,
  profit_margin_enabled,
  profit_margin_usd,
  cache_hours,
  rate_source_url
)
VALUES (
  'storefront',
  true,
  27,
  27,
  false,
  0,
  24,
  'https://open.er-api.com/v6/latest/USD'
)
ON CONFLICT (id) DO NOTHING;
