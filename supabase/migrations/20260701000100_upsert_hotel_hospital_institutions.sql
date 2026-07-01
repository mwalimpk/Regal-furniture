INSERT INTO public.product_institutions (name, slug, description, image_url, display_order, status)
VALUES
  ('Hospitals', 'hospitals', 'Practical seating, workstations, storage, and administrative furniture for healthcare teams and patient-facing spaces.', '/images/institutions/hospitals-reception.png', 2, 'active'),
  ('Hotels', 'hotels', 'Reception, lounge, back-office, dining, and room-support furniture for hospitality spaces that need comfort and polish.', '/images/institutions/hotels-lobby.png', 3, 'active'),
  ('Corporate Offices', 'corporate-offices', 'Executive suites, boardrooms, open-plan teams, receptions, and storage for growing business environments.', '/images/hero-slides/boardroom-office.jpeg', 5, 'active'),
  ('Property Developers', 'property-developers', 'Furniture packages for show units, sales offices, apartment amenities, and multi-room development handovers.', '/images/hero-slides/home-and-office.jpeg', 6, 'active')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;
