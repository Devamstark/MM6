import { User, Product, AuthResponse, ProductFilter, DashboardStats, Order, SellerStats } from '../types';
import { supabase } from './supabaseClient';

// ============================================================================
// MOCK DATA (Users Only - for Mock Login)
// ============================================================================

const MOCK_DELAY = 500;
const STORAGE_KEYS = {
  TOKEN: 'cm_token',
  USER: 'cm_user_data',
};

// Kept as requested, but updated IDs to UUID-like strings for compatibility
const INITIAL_USERS: User[] = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Admin User', email: 'admin@cloudmart.com', role: 'admin', isActive: true, createdAt: '2023-01-01' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Best Seller Inc.', email: 'seller@cloudmart.com', role: 'seller', isActive: true, createdAt: '2023-02-15' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'John Doe', email: 'john@example.com', role: 'user', isActive: true, createdAt: '2023-03-10' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Jane Smith', email: 'jane@example.com', role: 'user', isActive: true, createdAt: '2023-03-12' },
];

// Helper to simulate network delay for mock parts
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// API SERVICE
// ============================================================================

export const api = {
  // --- Auth (Mock + Supabase Hybrid) ---
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Check Mock Users first
    await delay(MOCK_DELAY);
    const mockUser = INITIAL_USERS.find(u => u.email === email);

    // Simple password check for mock users
    if (mockUser) {
      let isValid = false;
      if (email === 'admin@cloudmart.com' && password === 'admin') isValid = true;
      else if (email === 'seller@cloudmart.com' && password === 'seller') isValid = true;
      else if (mockUser.role === 'user' && password === 'password') isValid = true;

      if (isValid) {
        if (mockUser.isActive === false) throw new Error('Account is disabled. Contact admin.');
        const token = `mock-jwt-token-${mockUser.role}`;
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
        return { user: mockUser, token };
      }
    }

    // Attempt Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    if (data.user) {
      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata.full_name || 'User',
        role: data.user.user_metadata.role || 'user',
        isActive: true,
        createdAt: data.user.created_at
      };
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.session?.access_token || '');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { user, token: data.session?.access_token || '' };
    }

    throw new Error('Invalid credentials.');
  },

  register: async (name: string, email: string, password: string, role: 'user' | 'seller' = 'user'): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role
        }
      }
    });

    if (error) throw error;

    const newUser: User = {
      id: data.user?.id || 'temp-id',
      name,
      email,
      role,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    if (data.session) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.session.access_token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      return { user: newUser, token: data.session.access_token };
    } else {
      return { user: newUser, token: '' };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // --- Products (Supabase) ---
  getProducts: async (filters: ProductFilter = {}): Promise<Product[]> => {
    let query = supabase.from('products').select('*');

    if (filters.sellerId) query = query.eq('user_id', filters.sellerId);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.brand) query = query.eq('brand', filters.brand);
    if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice);
    if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);
    if (filters.isFeatured) query = query.eq('is_featured', true);
    if (filters.isPopular) query = query.eq('is_popular', true);

    const { data, error } = await query;
    if (error) throw error;

    let products = data as any[];

    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.description?.toLowerCase().includes(lowerSearch)
      );
    }

    if (filters.sort) {
      products.sort((a, b) => {
        if (filters.sort === 'price_asc') return a.price - b.price;
        if (filters.sort === 'price_desc') return b.price - a.price;
        return 0;
      });
    }

    return products.map(p => ({
      ...p,
      imageUrl: p.image_url,
      userId: p.user_id,
      isFeatured: p.is_featured,
      isPopular: p.is_popular,
      stock: p.stock_quantity
    }));
  },

  getProduct: async (id: string): Promise<Product | undefined> => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) return undefined;
    return {
      ...data,
      imageUrl: data.image_url,
      userId: data.user_id,
      isFeatured: data.is_featured,
      isPopular: data.is_popular,
      stock: data.stock_quantity
    };
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const { data, error } = await supabase.from('products').insert([{
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      image_url: product.imageUrl,
      stock_quantity: product.stock,
      is_featured: product.isFeatured,
      is_popular: product.isPopular,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }]).select().single();

    if (error) throw error;

    return {
      ...data,
      imageUrl: data.image_url,
      userId: data.user_id,
      isFeatured: data.is_featured,
      isPopular: data.is_popular,
      stock: data.stock_quantity
    };
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const dbUpdates: any = { ...updates };
    if (updates.imageUrl) { dbUpdates.image_url = updates.imageUrl; delete dbUpdates.imageUrl; }
    if (updates.stock) { dbUpdates.stock_quantity = updates.stock; delete dbUpdates.stock; }
    if (updates.isFeatured !== undefined) { dbUpdates.is_featured = updates.isFeatured; delete dbUpdates.isFeatured; }
    if (updates.isPopular !== undefined) { dbUpdates.is_popular = updates.isPopular; delete dbUpdates.isPopular; }

    const { data, error } = await supabase.from('products').update(dbUpdates).eq('id', id).select().single();
    if (error) throw error;

    return {
      ...data,
      imageUrl: data.image_url,
      userId: data.user_id,
      isFeatured: data.is_featured,
      isPopular: data.is_popular,
      stock: data.stock_quantity
    };
  },

  deleteProduct: async (id: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await supabase.from('products').select('category');
    if (!data) return [];
    return Array.from(new Set(data.map(p => p.category))).sort();
  },

  getBrands: async (): Promise<string[]> => {
    const { data } = await supabase.from('products').select('brand');
    if (!data) return [];
    return Array.from(new Set(data.map(p => p.brand))).sort();
  },

  // --- Orders & Checkout ---
  createOrder: async (orderData: { items: any[], shippingAddress: any, paymentDetails: any, totalPrice: number }): Promise<Order> => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      // Fallback for mock user: check storage (only works if we disable RLS or use Edge Functions, but for now we throw helpful error)
      throw new Error('Please sign in with a real account (Register) to place orders. Mock accounts cannot create orders in the live database.');
    }

    // 1. Create Order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      user_id: user.id,
      customer_name: user.user_metadata.full_name || orderData.shippingAddress.name,
      total_amount: orderData.totalPrice,
      status: 'pending'
    }).select().single();

    if (orderError) throw orderError;

    // 2. Create Order Items
    const orderItems = orderData.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // 3. Process Payment
    await api.processPayment({
      orderId: order.id,
      userId: user.id,
      amount: orderData.totalPrice,
      paymentMethod: 'Credit Card'
    });

    return {
      id: order.id,
      userId: order.user_id,
      customerName: order.customer_name,
      totalPrice: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      items: orderData.items
    };
  },

  getRecentOrders: async (sellerId?: string): Promise<Order[]> => {
    let query = supabase.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;

    return data.map((o: any) => ({
      id: o.id,
      userId: o.user_id,
      customerName: o.customer_name,
      totalPrice: o.total_amount,
      status: o.status,
      createdAt: o.created_at,
      items: o.order_items.map((oi: any) => ({
        ...oi.products,
        quantity: oi.quantity,
        id: oi.product_id
      }))
    }));
  },

  processPayment: async (paymentData: { orderId: string, userId: string, amount: number, paymentMethod: string }): Promise<any> => {
    const { data, error } = await supabase.from('payments').insert({
      order_id: paymentData.orderId,
      user_id: paymentData.userId,
      amount: paymentData.amount,
      status: 'completed',
      payment_method: paymentData.paymentMethod,
      transaction_id: `tx_${Date.now()}`
    }).select().single();

    if (error) throw error;
    return data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    const { data: orders } = await supabase.from('orders').select('total_amount');
    const totalRevenue = orders?.reduce((acc, o) => acc + o.total_amount, 0) || 0;

    return {
      totalRevenue,
      totalOrders: ordersCount || 0,
      totalProducts: productsCount || 0,
      totalUsers: usersCount || 0
    };
  },

  getSellerStats: async (sellerId: string): Promise<SellerStats> => {
    return {
      totalRevenue: 0,
      revenueGrowth: 0,
      unitsSold: 0,
      unitsGrowth: 0,
      conversionRate: 0,
      conversionGrowth: 0,
      monthlySales: []
    };
  },

  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data.map((p: any) => ({
      id: p.id,
      email: p.email,
      name: p.full_name,
      role: p.role,
      isActive: true,
      createdAt: p.created_at
    }));
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
    // Implement if needed
  }
};