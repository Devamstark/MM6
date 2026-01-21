-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES table (Extended to include Sellers)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  -- Added 'seller' to allowed roles
  role text default 'user' check (role in ('user', 'seller', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- PRODUCTS table (Enhanced with Brand and Featured flags)
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id), -- The seller ID
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text, -- Corresponds to imageUrl in frontend
  category text,
  brand text,
  stock_quantity integer default 0, -- Corresponds to stock
  is_featured boolean default false, -- Corresponds to isFeatured
  is_popular boolean default false, -- Corresponds to isPopular
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on products
alter table public.products enable row level security;

-- Products Policies
create policy "Products are viewable by everyone."
  on products for select
  using ( true );

create policy "Sellers and Admins can insert products."
  on products for insert
  with check ( exists ( select 1 from profiles where id = auth.uid() and role in ('seller', 'admin') ) );

create policy "Sellers can update their own products."
  on products for update
  using ( auth.uid() = user_id );

create policy "Admins can update any product."
  on products for update
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Sellers can delete their own products."
  on products for delete
  using ( auth.uid() = user_id );

-- ORDERS table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  customer_name text,
  status text default 'pending' check (status in ('pending', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) not null, -- Corresponds to totalPrice
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on orders
alter table public.orders enable row level security;

-- Orders Policies
create policy "Users can view their own orders."
  on orders for select
  using ( auth.uid() = user_id );

create policy "Sellers and Admins can view all orders."
  on orders for select
  using ( exists ( select 1 from profiles where id = auth.uid() and role in ('seller', 'admin') ) );

create policy "Users can create their own orders."
  on orders for insert
  with check ( auth.uid() = user_id );

-- ORDER ITEMS table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null,
  price_at_purchase decimal(10,2) not null
);

-- Enable RLS on order_items
alter table public.order_items enable row level security;

-- Order Items Policies
create policy "Users can view their own order items through orders."
  on order_items for select
  using ( exists ( select 1 from orders where id = order_items.order_id and user_id = auth.uid() ) );

create policy "Sellers and Admins can view all order items."
  on order_items for select
  using ( exists ( select 1 from profiles where id = auth.uid() and role in ('seller', 'admin') ) );

create policy "Users can insert their own order items."
  on order_items for insert
  with check ( exists ( select 1 from orders where id = order_items.order_id and user_id = auth.uid() ) );

-- TRIGGER to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'user') -- Allow mapping role from signup metadata if safe, or default to user
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SEED DATA
insert into public.products (name, description, price, image_url, category, brand, stock_quantity, is_featured, is_popular) values
('Wireless Headphones', 'Premium noise cancelling.', 199.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', 'Electronics', 'Sony', 50, true, true),
('Smart Watch', 'Fitness tracking redefined.', 299.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', 'Electronics', 'Apple', 30, true, false),
('Running Shoes', 'Ultralight performance.', 89.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'Sports', 'Nike', 100, false, true),
('Leather Backpack', 'Daily urban carry.', 129.50, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', 'Accessories', 'Herschel', 25, false, false);

-- PAYMENTS table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  user_id uuid references auth.users not null,
  amount decimal(10,2) not null,
  currency text default 'USD',
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  provider text,
  transaction_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on payments
alter table public.payments enable row level security;

-- Payments Policies
create policy "Users can view their own payments."
  on payments for select
  using ( auth.uid() = user_id );

create policy "Admins can view all payments."
  on payments for select
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Users can insert their own payments."
  on payments for insert
  with check ( auth.uid() = user_id );

