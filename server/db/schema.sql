CREATE TABLE IF NOT EXISTS auth_users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  user_metadata LONGTEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  access_token VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  expires_at BIGINT NOT NULL,
  INDEX idx_sessions_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  full_name VARCHAR(255) NULL,
  currency VARCHAR(16) NULL,
  phone VARCHAR(64) NULL,
  status VARCHAR(32) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_profiles_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  role VARCHAR(32) NOT NULL,
  INDEX idx_user_roles_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS properties (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NULL,
  long_description LONGTEXT NULL,
  property_type VARCHAR(255) NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(16) NOT NULL DEFAULT 'USD',
  location VARCHAR(255) NULL,
  city VARCHAR(128) NULL,
  country VARCHAR(128) NULL,
  images LONGTEXT NULL,
  color_variants LONGTEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'approved',
  featured TINYINT(1) NULL DEFAULT 0,
  bedrooms INT NULL DEFAULT 0,
  bathrooms INT NULL DEFAULT 0,
  area_sqft INT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  INDEX idx_properties_user_id (user_id),
  INDEX idx_properties_type (property_type)
);

CREATE TABLE IF NOT EXISTS product_pairings (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL UNIQUE,
  recommended_ids LONGTEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_promotions (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NULL,
  promotion_type VARCHAR(32) NOT NULL,
  discount_type VARCHAR(32) NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(12,2) NULL,
  offer_label VARCHAR(128) NULL,
  product_ids LONGTEXT NOT NULL,
  category_targets LONGTEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  INDEX idx_product_promotions_status (status),
  INDEX idx_product_promotions_type (promotion_type),
  INDEX idx_product_promotions_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS catalogues (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  document_url LONGTEXT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(128) NOT NULL,
  cover_image_url LONGTEXT NOT NULL,
  imported_count INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'uploaded',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  INDEX idx_catalogues_user_id (user_id),
  INDEX idx_catalogues_year_month (year, month),
  INDEX idx_catalogues_category (category)
);

CREATE TABLE IF NOT EXISTS hero_slides (
  id VARCHAR(64) PRIMARY KEY,
  eyebrow VARCHAR(255) NULL,
  accent_title VARCHAR(255) NULL,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NULL,
  image_url LONGTEXT NOT NULL,
  image_alt VARCHAR(255) NULL,
  cta_label VARCHAR(128) NULL,
  cta_href VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 1,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  INDEX idx_hero_slides_status (status),
  INDEX idx_hero_slides_display_order (display_order),
  INDEX idx_hero_slides_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS promotional_banners (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle LONGTEXT NULL,
  category VARCHAR(255) NOT NULL,
  background_image_url LONGTEXT NULL,
  cta_label VARCHAR(128) NULL,
  cta_href VARCHAR(255) NULL,
  placements LONGTEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  has_countdown TINYINT(1) NOT NULL DEFAULT 0,
  countdown_ends_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  INDEX idx_promotional_banners_status (status),
  INDEX idx_promotional_banners_category (category),
  INDEX idx_promotional_banners_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS inquiries (
  id VARCHAR(64) PRIMARY KEY,
  created_at DATETIME NOT NULL,
  email VARCHAR(255) NOT NULL,
  message LONGTEXT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NULL,
  property_id VARCHAR(64) NULL,
  status VARCHAR(32) NULL,
  user_id VARCHAR(64) NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(64) PRIMARY KEY,
  created_at DATETIME NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  notes LONGTEXT NULL,
  phone VARCHAR(64) NULL,
  source VARCHAR(128) NULL,
  status VARCHAR(32) NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  created_at DATETIME NOT NULL,
  currency VARCHAR(16) NOT NULL DEFAULT 'USD',
  items LONGTEXT NOT NULL,
  phone VARCHAR(64) NULL,
  shipping_address LONGTEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  INDEX idx_orders_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  booking_date DATE NOT NULL,
  created_at DATETIME NOT NULL,
  notes LONGTEXT NULL,
  property_id VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  updated_at DATETIME NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  INDEX idx_bookings_user_id (user_id),
  INDEX idx_bookings_property_id (property_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  body LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL,
  `read` TINYINT(1) NULL DEFAULT 0,
  recipient_id VARCHAR(64) NULL,
  sender_id VARCHAR(64) NULL,
  subject VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(64) PRIMARY KEY,
  amount DECIMAL(12,2) NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  currency VARCHAR(16) NULL DEFAULT 'USD',
  end_date DATE NULL,
  plan_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  updated_at DATETIME NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  INDEX idx_subscriptions_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS rfq_requests (
  id VARCHAR(64) PRIMARY KEY,
  created_at DATETIME NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NULL,
  product_interest VARCHAR(255) NULL,
  quantity INT NULL,
  message LONGTEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'New'
);
