-- ============================================================================
-- CLOUDMART - SAFE MIGRATION SCRIPT
-- ✅ This preserves existing data and adds new tables/columns
-- Run this on your existing database
-- ============================================================================

-- Enable Required Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";


-- ============================================================================
-- STEP 1: Update existing PROFILES table
-- ============================================================================
DO $$ 
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='updated_at') THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz DEFAULT timezone('utc'::text, now());
  END IF;
END $$;


-- ============================================================================
-- STEP 2: Create SELLERS table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sellers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  business_description text,
  business_email text,
  business_phone text,
  tax_id text,
  verification_status text DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
  verified_at timestamptz,
  rejection_reason text,
  total_sales decimal(12,2) DEFAULT 0.00,
  rating decimal(3,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Sellers are viewable by everyone." ON public.sellers;
DROP POLICY IF EXISTS "Users can create their own seller profile." ON public.sellers;
DROP POLICY IF EXISTS "Sellers can update their own profile." ON public.sellers;
DROP POLICY IF EXISTS "Admins can update any seller." ON public.sellers;

CREATE POLICY "Sellers are viewable by everyone."
  ON sellers FOR SELECT USING (true);

CREATE POLICY "Users can create their own seller profile."
  ON sellers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can update their own profile."
  ON sellers FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any seller."
  ON sellers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- STEP 3: Create CATEGORIES table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text UNIQUE,
  description text,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone." ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories." ON public.categories;

CREATE POLICY "Categories are viewable by everyone."
  ON categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories."
  ON categories FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- STEP 4: Update existing PRODUCTS table
-- ============================================================================
DO $$ 
BEGIN
  -- Add seller_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='seller_id') THEN
    ALTER TABLE public.products ADD COLUMN seller_id uuid REFERENCES public.sellers(id) ON DELETE CASCADE;
  END IF;
  
  -- Add category_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='category_id') THEN
    ALTER TABLE public.products ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
  
  -- Add new columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='slug') THEN
    ALTER TABLE public.products ADD COLUMN slug text UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='compare_at_price') THEN
    ALTER TABLE public.products ADD COLUMN compare_at_price decimal(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='cost_price') THEN
    ALTER TABLE public.products ADD COLUMN cost_price decimal(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='sku') THEN
    ALTER TABLE public.products ADD COLUMN sku text UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='barcode') THEN
    ALTER TABLE public.products ADD COLUMN barcode text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='low_stock_threshold') THEN
    ALTER TABLE public.products ADD COLUMN low_stock_threshold integer DEFAULT 10;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='track_inventory') THEN
    ALTER TABLE public.products ADD COLUMN track_inventory boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='is_active') THEN
    ALTER TABLE public.products ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='is_digital') THEN
    ALTER TABLE public.products ADD COLUMN is_digital boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='meta_title') THEN
    ALTER TABLE public.products ADD COLUMN meta_title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='meta_description') THEN
    ALTER TABLE public.products ADD COLUMN meta_description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='views_count') THEN
    ALTER TABLE public.products ADD COLUMN views_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='sales_count') THEN
    ALTER TABLE public.products ADD COLUMN sales_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='rating') THEN
    ALTER TABLE public.products ADD COLUMN rating decimal(3,2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='review_count') THEN
    ALTER TABLE public.products ADD COLUMN review_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='published_at') THEN
    ALTER TABLE public.products ADD COLUMN published_at timestamptz;
  END IF;
END $$;


-- ============================================================================
-- STEP 5: Create PRODUCT_IMAGES table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product images are viewable by everyone." ON public.product_images;
DROP POLICY IF EXISTS "Sellers can manage their product images." ON public.product_images;
DROP POLICY IF EXISTS "Admins can manage any product images." ON public.product_images;

CREATE POLICY "Product images are viewable by everyone."
  ON product_images FOR SELECT USING (true);

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
-- STEP 6: Create ADDRESSES table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
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

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own addresses." ON public.addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses." ON public.addresses;
DROP POLICY IF EXISTS "Users can update their own addresses." ON public.addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses." ON public.addresses;

CREATE POLICY "Users can view their own addresses."
  ON addresses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses."
  ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses."
  ON addresses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses."
  ON addresses FOR DELETE USING (auth.uid() = user_id);


-- ============================================================================
-- STEP 7: Update existing ORDERS table
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='address_id') THEN
    ALTER TABLE public.orders ADD COLUMN address_id uuid REFERENCES public.addresses(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='order_number') THEN
    ALTER TABLE public.orders ADD COLUMN order_number text UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='customer_email') THEN
    ALTER TABLE public.orders ADD COLUMN customer_email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='customer_phone') THEN
    ALTER TABLE public.orders ADD COLUMN customer_phone text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='subtotal') THEN
    ALTER TABLE public.orders ADD COLUMN subtotal decimal(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='tax_amount') THEN
    ALTER TABLE public.orders ADD COLUMN tax_amount decimal(10,2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='shipping_amount') THEN
    ALTER TABLE public.orders ADD COLUMN shipping_amount decimal(10,2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='discount_amount') THEN
    ALTER TABLE public.orders ADD COLUMN discount_amount decimal(10,2) DEFAULT 0.00;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='payment_status') THEN
    ALTER TABLE public.orders ADD COLUMN payment_status text DEFAULT 'unpaid' 
      CHECK (payment_status IN ('unpaid', 'paid', 'partially_refunded', 'refunded', 'failed'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='fulfillment_status') THEN
    ALTER TABLE public.orders ADD COLUMN fulfillment_status text DEFAULT 'unfulfilled' 
      CHECK (fulfillment_status IN ('unfulfilled', 'partially_fulfilled', 'fulfilled'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='customer_note') THEN
    ALTER TABLE public.orders ADD COLUMN customer_note text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='internal_note') THEN
    ALTER TABLE public.orders ADD COLUMN internal_note text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='tracking_number') THEN
    ALTER TABLE public.orders ADD COLUMN tracking_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='tracking_url') THEN
    ALTER TABLE public.orders ADD COLUMN tracking_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='carrier') THEN
    ALTER TABLE public.orders ADD COLUMN carrier text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='updated_at') THEN
    ALTER TABLE public.orders ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='confirmed_at') THEN
    ALTER TABLE public.orders ADD COLUMN confirmed_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='shipped_at') THEN
    ALTER TABLE public.orders ADD COLUMN shipped_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='delivered_at') THEN
    ALTER TABLE public.orders ADD COLUMN delivered_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='cancelled_at') THEN
    ALTER TABLE public.orders ADD COLUMN cancelled_at timestamptz;
  END IF;
END $$;


-- ============================================================================
-- STEP 8: Update ORDER_ITEMS table
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='order_items' AND column_name='seller_id') THEN
    ALTER TABLE public.order_items ADD COLUMN seller_id uuid REFERENCES public.sellers(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='order_items' AND column_name='product_name') THEN
    ALTER TABLE public.order_items ADD COLUMN product_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='order_items' AND column_name='product_sku') THEN
    ALTER TABLE public.order_items ADD COLUMN product_sku text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='order_items' AND column_name='unit_price') THEN
    ALTER TABLE public.order_items ADD COLUMN unit_price decimal(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='order_items' AND column_name='total_price') THEN
    ALTER TABLE public.order_items ADD COLUMN total_price decimal(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='order_items' AND column_name='fulfillment_status') THEN
    ALTER TABLE public.order_items ADD COLUMN fulfillment_status text DEFAULT 'unfulfilled' 
      CHECK (fulfillment_status IN ('unfulfilled', 'fulfilled', 'cancelled'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='order_items' AND column_name='created_at') THEN
    ALTER TABLE public.order_items ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;


-- ============================================================================
-- STEP 9: Create REVIEWS table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON public.reviews;
DROP POLICY IF EXISTS "Users can view all reviews (including unapproved)." ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews." ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews." ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews." ON public.reviews;

CREATE POLICY "Reviews are viewable by everyone."
  ON reviews FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view all reviews (including unapproved)."
  ON reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'seller')));

CREATE POLICY "Users can create reviews."
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews."
  ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews."
  ON reviews FOR DELETE USING (auth.uid() = user_id);


-- ============================================================================
-- STEP 10: Create WISHLISTS table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wishlist." ON public.wishlists;
DROP POLICY IF EXISTS "Users can add to their wishlist." ON public.wishlists;
DROP POLICY IF EXISTS "Users can remove from their wishlist." ON public.wishlists;

CREATE POLICY "Users can view their own wishlist."
  ON wishlists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist."
  ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist."
  ON wishlists FOR DELETE USING (auth.uid() = user_id);


-- ============================================================================
-- STEP 11: Create NOTIFICATIONS table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('order_update', 'payment', 'product', 'review', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  related_id uuid,
  related_type text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications." ON public.notifications;

CREATE POLICY "Users can view their own notifications."
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications."
  ON notifications FOR UPDATE USING (auth.uid() = user_id);


-- ============================================================================
-- STEP 12: Create AUDIT_LOGS table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view audit logs." ON public.audit_logs;

CREATE POLICY "Only admins can view audit logs."
  ON audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- STEP 13: Create Indexes (if not exists)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON public.sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_verification_status ON public.sellers(verification_status);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON public.product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses(is_default);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller_id ON public.order_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);


-- ============================================================================
-- STEP 14: Create Functions & Triggers
-- ============================================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_sellers_updated_at ON public.sellers;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_addresses_updated_at ON public.addresses;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;

-- Create triggers
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
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number = 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();


-- Function: Update product rating when review is added/updated
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET 
    rating = (SELECT COALESCE(AVG(rating)::decimal(3,2), 0) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_rating_on_review ON public.reviews;
CREATE TRIGGER update_product_rating_on_review AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();


-- ============================================================================
-- STEP 15: Seed Categories (if empty)
-- ============================================================================
INSERT INTO public.categories (name, slug, description, parent_id)
SELECT 'Electronics', 'electronics', 'Electronic devices and accessories', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'electronics');

INSERT INTO public.categories (name, slug, description, parent_id)
SELECT 'Fashion', 'fashion', 'Clothing and accessories', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'fashion');

INSERT INTO public.categories (name, slug, description, parent_id)
SELECT 'Home & Garden', 'home-garden', 'Home improvement and garden supplies', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'home-garden');

INSERT INTO public.categories (name, slug, description, parent_id)
SELECT 'Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sports-outdoors');

INSERT INTO public.categories (name, slug, description, parent_id)
SELECT 'Books', 'books', 'Physical and digital books', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'books');


-- ============================================================================
-- ✅ MIGRATION COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Verify all tables were created/updated successfully
-- 2. Migrate existing product.user_id to seller_id (if needed)
-- 3. Populate product_images from existing image_url fields
-- 4. Test RLS policies
-- ============================================================================
