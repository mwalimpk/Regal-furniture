CREATE TABLE public.rfq_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  product_interest TEXT,
  quantity INTEGER,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rfq_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit rfq" ON public.rfq_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view rfq" ON public.rfq_requests
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update rfq" ON public.rfq_requests
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_rfq_updated_at
  BEFORE UPDATE ON public.rfq_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
