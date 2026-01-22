-- ============================================================================
-- CLOUDMART E-COMMERCE DATABASE SCHEMA
-- Enterprise-Grade Supabase Setup with Advanced Features
-- ============================================================================

-- Enable Required Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For performance monitoring


-- ============================================================================
-- STEP 1: PROFILES TABLE (Base User Management)
-- ============================================================================
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
  avatar_url text,
  phone text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


-- ============================================================================
-- STEP 2: SELLERS TABLE (Separate Seller Management)
-- ============================================================================
CREATE TABLE public.sellers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  business_description text,
  business_email text,
  business_phone text,
  tax_id text, -- For tax compliance
  verification_status text DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
  verified_at timestamptz,
  rejection_reason text,
  total_sales decimal(12,2) DEFAULT 0.00,
  rating decimal(3,2) DEFAULT 0.00, -- Average seller rating
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on sellers
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Sellers Policies
CREATE POLICY "Sellers are viewable by everyone."
  ON sellers FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own seller profile."
  ON sellers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can update their own profile."
  ON sellers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any seller."
  ON sellers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- STEP 3: CATEGORIES TABLE (Normalized Hierarchical Categories)
-- ============================================================================
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text UNIQUE, -- URL-friendly name
  description text,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone."
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories."
  ON categories FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- STEP 4: PRODUCTS TABLE (Enhanced with Normalized Relationships)
-- ============================================================================
CREATE TABLE public.products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE, -- URL-friendly product name
  description text,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price decimal(10,2), -- Original price for showing discounts
  cost_price decimal(10,2), -- For profit calculations
  
  -- Legacy field (kept for backward compatibility, will migrate to product_images)
  image_url text,
  
  -- Product attributes
  category text, -- Legacy field, will be replaced by category_id
  brand text,
  sku text UNIQUE, -- Stock Keeping Unit
  barcode text,
  
  -- Inventory
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold integer DEFAULT 10,
  track_inventory boolean DEFAULT true,
  
  -- Product flags
  is_featured boolean DEFAULT false,
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_digital boolean DEFAULT false, -- For digital products
  
  -- SEO
  meta_title text,
  meta_description text,
  
  -- Stats
  views_count integer DEFAULT 0,
  sales_count integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0.00,
  review_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()),
  published_at timestamptz
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Products are viewable by everyone."
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Sellers can insert their own products."
  ON products FOR INSERT
  WITH CHECK (
    seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  );

CREATE POLICY "Sellers can update their own products."
  ON products FOR UPDATE
  USING (
    seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update any product."
  ON products FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Sellers can delete their own products."
  ON products FOR DELETE
  USING (
    seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete any product."
  ON products FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- STEP 5: PRODUCT IMAGES TABLE (Multiple Images Support)
-- ============================================================================
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Product Images Policies
CREATE POLICY "Product images are viewable by everyone."
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage their product images."
  ON product_images FOR ALL
  USING (
    product_id IN (
      SELECT p.id FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage any product images."
  ON product_images FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- STEP 6: ADDRESSES TABLE (Shipping & Billing)
-- ============================================================================
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  address_type text DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing', 'both')),
  full_name text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state_province text,
  country text NOT NULL,
  postal_code text,
  phone text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on addresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Addresses Policies
CREATE POLICY "Users can view their own addresses."
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses."
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses."
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses."
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================================
-- STEP 7: ORDERS TABLE (Enhanced with Address & Payment Status)
-- ============================================================================
CREATE TABLE public.orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  address_id uuid REFERENCES public.addresses(id),
  
  -- Order details
  order_number text UNIQUE NOT NULL, -- Human-readable order number
  customer_name text,
  customer_email text,
  customer_phone text,
  
  -- Financial
  subtotal decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) DEFAULT 0.00,
  shipping_amount decimal(10,2) DEFAULT 0.00,
  discount_amount decimal(10,2) DEFAULT 0.00,
  total_amount decimal(10,2) NOT NULL,
  
  -- Status tracking
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partially_refunded', 'refunded', 'failed')),
  fulfillment_status text DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partially_fulfilled', 'fulfilled')),
  
  -- Notes
  customer_note text,
  internal_note text,
  
  -- Tracking
  tracking_number text,
  tracking_url text,
  carrier text,
  
  -- Timestamps
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()),
  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders Policies
CREATE POLICY "Users can view their own orders."
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sellers can view orders containing their products."
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN sellers s ON p.seller_id = s.id
      WHERE oi.order_id = orders.id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all orders."
  ON orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can create their own orders."
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can update orders with their products."
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN sellers s ON p.seller_id = s.id
      WHERE oi.order_id = orders.id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update any order."
  ON orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- STEP 8: ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE public.order_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) NOT NULL,
  seller_id uuid REFERENCES public.sellers(id) NOT NULL,
  
  -- Product snapshot (in case product details change)
  product_name text NOT NULL,
  product_sku text,
  
  -- Pricing
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  
  -- Fulfillment
  fulfillment_status text DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'fulfilled', 'cancelled')),
  
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order Items Policies
CREATE POLICY "Users can view their own order items."
  ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

CREATE POLICY "Sellers can view their order items."
  ON order_items FOR SELECT
  USING (
    seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all order items."
  ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert their own order items."
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );


-- ============================================================================
-- STEP 9: PAYMENTS TABLE (Enhanced)
-- ============================================================================
CREATE TABLE public.payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  
  -- Payment details
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  
  -- Payment method
  payment_method text CHECK (payment_method IN ('credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash_on_delivery')),
  provider text, -- stripe, paypal, etc.
  
  -- Transaction details
  transaction_id text UNIQUE,
  provider_payment_id text, -- ID from payment provider
  
  -- Card details (last 4 digits only for security)
  card_last4 text,
  card_brand text,
  
  -- Metadata
  metadata jsonb, -- For storing additional provider-specific data
  error_message text,
  
  -- Timestamps
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  failed_at timestamptz
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments Policies
CREATE POLICY "Users can view their own payments."
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments."
  ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert their own payments."
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payments."
  ON payments FOR UPDATE
  USING (true); -- Payment webhooks need to update


-- ============================================================================
-- STEP 10: REVIEWS & RATINGS TABLE (Social Features)
-- ============================================================================
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES public.orders(id), -- Verified purchase
  
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  
  -- Moderation
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  
  -- Helpfulness
  helpful_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now(),
  
  -- Prevent duplicate reviews
  UNIQUE(product_id, user_id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone."
  ON reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can view all reviews (including unapproved)."
  ON reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'seller')));

CREATE POLICY "Users can create reviews."
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews."
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews."
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================================
-- STEP 11: WISHLIST TABLE (Social Features)
-- ============================================================================
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Prevent duplicate wishlist items
  UNIQUE(user_id, product_id)
);

-- Enable RLS on wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Wishlist Policies
CREATE POLICY "Users can view their own wishlist."
  ON wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist."
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist."
  ON wishlists FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================================
-- STEP 12: AUDIT LOGS TABLE (Security & Compliance)
-- ============================================================================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id),
  
  -- Action details
  action text NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  table_name text,
  record_id uuid,
  
  -- Changes
  old_values jsonb,
  new_values jsonb,
  
  -- Request metadata
  ip_address inet,
  user_agent text,
  
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs Policies
CREATE POLICY "Only admins can view audit logs."
  ON audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- STEP 13: NOTIFICATIONS TABLE (Real-time Features)
-- ============================================================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  type text NOT NULL CHECK (type IN ('order_update', 'payment', 'product', 'review', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  
  -- Related entities
  related_id uuid, -- order_id, product_id, etc.
  related_type text, -- 'order', 'product', etc.
  
  -- Status
  is_read boolean DEFAULT false,
  read_at timestamptz,
  
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
CREATE POLICY "Users can view their own notifications."
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications."
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================================
-- STEP 14: PERFORMANCE INDEXES ⚡
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Sellers
CREATE INDEX idx_sellers_user_id ON public.sellers(user_id);
CREATE INDEX idx_sellers_verification_status ON public.sellers(verification_status);

-- Categories
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);

-- Products
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

-- Product Images
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_is_primary ON public.product_images(is_primary);

-- Addresses
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX idx_addresses_is_default ON public.addresses(is_default);

-- Orders
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_order_items_seller_id ON public.order_items(seller_id);

-- Payments
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_transaction_id ON public.payments(transaction_id);

-- Reviews
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- Wishlists
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);


-- ============================================================================
-- STEP 15: DATABASE FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Function: Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Apply order number trigger
CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();


-- Function: Update product rating when review is added/updated
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET 
    rating = (SELECT AVG(rating)::decimal(3,2) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();


-- Function: Reduce stock when order is created
CREATE OR REPLACE FUNCTION reduce_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id AND track_inventory = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reduce_stock_on_order AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION reduce_product_stock();


-- Function: Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- STEP 16: USEFUL DATABASE VIEWS
-- ============================================================================

-- View: Product details with seller info
CREATE OR REPLACE VIEW product_details AS
SELECT 
  p.*,
  s.business_name as seller_name,
  s.rating as seller_rating,
  c.name as category_name,
  c.slug as category_slug,
  (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
FROM products p
LEFT JOIN sellers s ON p.seller_id = s.id
LEFT JOIN categories c ON p.category_id = c.id;


-- View: Order summary with items
CREATE OR REPLACE VIEW order_summary AS
SELECT 
  o.*,
  COUNT(oi.id) as item_count,
  STRING_AGG(oi.product_name, ', ') as product_names
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;


-- View: Seller analytics
CREATE OR REPLACE VIEW seller_analytics AS
SELECT 
  s.id as seller_id,
  s.business_name,
  COUNT(DISTINCT p.id) as total_products,
  COUNT(DISTINCT oi.order_id) as total_orders,
  COALESCE(SUM(oi.total_price), 0) as total_revenue,
  COALESCE(AVG(r.rating), 0) as avg_product_rating
FROM sellers s
LEFT JOIN products p ON s.id = p.seller_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY s.id, s.business_name;


-- ============================================================================
-- STEP 17: SEED DATA
-- ============================================================================

-- Seed Categories
INSERT INTO public.categories (name, slug, description, parent_id) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories', NULL),
('Fashion', 'fashion', 'Clothing and accessories', NULL),
('Home & Garden', 'home-garden', 'Home improvement and garden supplies', NULL),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', NULL),
('Books', 'books', 'Physical and digital books', NULL);

-- Seed subcategories (get parent IDs first)
INSERT INTO public.categories (name, slug, description, parent_id)
SELECT 'Laptops', 'laptops', 'Portable computers', id FROM categories WHERE slug = 'electronics'
UNION ALL
SELECT 'Headphones', 'headphones', 'Audio devices', id FROM categories WHERE slug = 'electronics'
UNION ALL
SELECT 'Mens Clothing', 'mens-clothing', 'Clothing for men', id FROM categories WHERE slug = 'fashion'
UNION ALL
SELECT 'Womens Clothing', 'womens-clothing', 'Clothing for women', id FROM categories WHERE slug = 'fashion';

-- Seed Products (without seller_id for now - will need to be updated after sellers are created)
INSERT INTO public.products (name, slug, description, price, image_url, category, brand, stock_quantity, is_featured, is_popular) VALUES
('Wireless Headphones', 'wireless-headphones', 'Premium noise cancelling headphones with 30-hour battery life.', 199.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', 'Electronics', 'Sony', 50, true, true),
('Smart Watch', 'smart-watch', 'Fitness tracking redefined with heart rate monitor and GPS.', 299.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', 'Electronics', 'Apple', 30, true, false),
('Running Shoes', 'running-shoes', 'Ultralight performance running shoes for serious athletes.', 89.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'Sports', 'Nike', 100, false, true),
('Leather Backpack', 'leather-backpack', 'Premium leather backpack for daily urban carry.', 129.50, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', 'Accessories', 'Herschel', 25, false, false),
('Mechanical Keyboard', 'mechanical-keyboard', 'RGB gaming keyboard with Cherry MX switches.', 149.99, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', 'Electronics', 'Corsair', 40, true, true),
('Yoga Mat', 'yoga-mat', 'Non-slip eco-friendly yoga mat with carrying strap.', 34.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f', 'Sports', 'Manduka', 75, false, false);


-- ============================================================================
-- NOTES FOR MIGRATION
-- ============================================================================
-- 
-- IMPORTANT: This schema includes legacy fields for backward compatibility:
-- - products.category (text) - Should migrate to category_id
-- - products.image_url (text) - Should migrate to product_images table
-- - products.user_id - Should migrate to seller_id
--
-- Migration Steps:
-- 1. Create sellers from existing profiles with role='seller'
-- 2. Update products.seller_id from sellers table
-- 3. Migrate products.category to categories and update category_id
-- 4. Migrate products.image_url to product_images table
-- 5. Drop legacy columns after verification
--
-- ============================================================================
