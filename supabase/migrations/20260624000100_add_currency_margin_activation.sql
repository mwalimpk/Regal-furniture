ALTER TABLE public.currency_settings
  ADD COLUMN IF NOT EXISTS profit_margin_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.currency_settings
  ALTER COLUMN profit_margin_usd SET DEFAULT 0;
