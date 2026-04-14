-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create property status enum
CREATE TYPE public.property_status AS ENUM ('pending', 'approved', 'rejected');

-- Create booking status enum  
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'inactive', 'expired');

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  currency TEXT DEFAULT 'KES',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL DEFAULT 'House',
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  location TEXT,
  city TEXT,
  country TEXT DEFAULT 'Kenya',
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area_sqft INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  status property_status NOT NULL DEFAULT 'pending',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved properties viewable by everyone" ON public.properties FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON public.properties FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete properties" ON public.properties FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Inquiries table
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own inquiries" ON public.inquiries FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update inquiries" ON public.inquiries FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update bookings" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view leads" ON public.leads FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Recipients can update messages" ON public.messages FOR UPDATE USING (auth.uid() = recipient_id);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'KES',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Timestamps triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);
CREATE POLICY "Property images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "Authenticated users can upload property images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');