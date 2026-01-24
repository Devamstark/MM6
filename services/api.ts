import axios from 'axios';
import { User, Product, AuthResponse, ProductFilter, DashboardStats, Order, SellerStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT to headers
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to map Snake Case (API) to Camel Case (Frontend)
const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: parseFloat(p.price),
  category: p.category,
  subcategory: p.subcategory, // New
  brand: p.brand,
  imageUrl: p.image_url,
  additionalImages: p.additional_images || [], // New
  stock: p.stock_quantity,
  gender: p.gender, // New
  sizes: p.sizes || [], // New
  colors: p.colors || [], // New
  isFeatured: p.is_featured,
  isPopular: p.is_popular,
  userId: p.seller, // mapped from 'seller' FK
  createdAt: p.created_at,
});

const mapOrder = (o: any): Order => ({
  id: o.id,
  userId: o.user,
  customerName: o.customer_name,
  totalPrice: parseFloat(o.total_amount),
  status: o.status,
  createdAt: o.created_at,
  items: o.items.map((i: any) => ({
    id: i.product?.id,
    name: i.product?.name || 'Unknown Product',
    price: parseFloat(i.price_at_purchase),
    quantity: i.quantity,
    imageUrl: i.product?.image_url,
  })),
});

// Helper to map User (API) to Frontend
const mapUser = (u: any): User => ({
  id: u.id,
  name: u.first_name ? `${u.first_name} ${u.last_name}`.trim() : (u.username || u.email),
  email: u.email,
  role: u.role,
  bio: u.bio,
  bonusPoints: u.bonus_points || 0,
  isActive: u.is_active,
  createdAt: u.date_joined,
  token: u.token // preserved if exists
});

export const api = {
  // --- Auth ---
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await client.post('/auth/login/', { username: email, password });
      const { access, refresh } = response.data;

      // Store tokens
      localStorage.setItem('cm_token', access);
      localStorage.setItem('cm_refresh', refresh);

      // Fetch User Profile
      const userResponse = await client.get('/users/me/');
      const userData = userResponse.data;
      const user = mapUser(userData);

      localStorage.setItem('cm_user_data', JSON.stringify(user));

      return { user, token: access };
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  },

  register: async (name: string, email: string, password: string, role: 'user' | 'seller' = 'user'): Promise<AuthResponse> => {
    // Call Django Register View
    const response = await client.post('/auth/register/', {
      email,
      password,
      role,
      name
    });

    // Auto-login after register (optional, but typical UX) to get tokens
    // Since RegisterView returns User (not token), we need to call login
    return api.login(email, password);
  },

  logout: async () => {
    localStorage.removeItem('cm_token');
    localStorage.removeItem('cm_refresh');
    localStorage.removeItem('cm_user_data');
  },

  // --- Products ---
  getProducts: async (filters: ProductFilter = {}): Promise<Product[]> => {
    const params: any = {};
    if (filters.category) params.category = filters.category;
    if (filters.brand) params.brand = filters.brand;
    if (filters.sellerId) params.seller = filters.sellerId;
    if (filters.search) params.search = filters.search;
    if (filters.sort) params.ordering = filters.sort === 'price_asc' ? 'price' : '-price';

    const response = await client.get('/products/', { params });
    return response.data.map(mapProduct);
  },

  getProduct: async (id: string): Promise<Product | undefined> => {
    try {
      const response = await client.get(`/products/${id}/`);
      return mapProduct(response.data);
    } catch (e) {
      return undefined;
    }
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const formData = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory, // New
      brand: product.brand,
      stock_quantity: product.stock,
      image_url: product.imageUrl,
      additional_images: product.additionalImages || [], // New
      gender: product.gender || 'Unisex', // New
      sizes: product.sizes || [], // New
      colors: product.colors || [], // New
      is_featured: product.isFeatured || false,
      is_popular: product.isPopular || false,
    };
    const response = await client.post('/products/', formData);
    return mapProduct(response.data);
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const formData: any = {};
    if (updates.name) formData.name = updates.name;
    if (updates.description) formData.description = updates.description;
    if (updates.price) formData.price = updates.price;
    if (updates.category) formData.category = updates.category;
    if (updates.subcategory) formData.subcategory = updates.subcategory;
    if (updates.brand) formData.brand = updates.brand;
    if (updates.stock) formData.stock_quantity = updates.stock;
    if (updates.imageUrl) formData.image_url = updates.imageUrl;
    if (updates.additionalImages) formData.additional_images = updates.additionalImages;
    if (updates.gender) formData.gender = updates.gender;
    if (updates.sizes) formData.sizes = updates.sizes;
    if (updates.colors) formData.colors = updates.colors;
    if (updates.isFeatured !== undefined) formData.is_featured = updates.isFeatured;
    if (updates.isPopular !== undefined) formData.is_popular = updates.isPopular;

    const response = await client.patch(`/products/${id}/`, formData);
    return mapProduct(response.data);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await client.delete(`/products/${id}/`);
  },

  getCategories: async (): Promise<string[]> => {
    const response = await client.get('/products/');
    const products = response.data;
    const categories = new Set(products.map((p: any) => p.category));
    return Array.from(categories) as string[];
  },

  getBrands: async (): Promise<string[]> => {
    const response = await client.get('/products/');
    const products = response.data;
    const brands = new Set(products.map((p: any) => p.brand));
    return Array.from(brands) as string[];
  },

  // --- Orders ---
  createOrder: async (orderData: { items: any[], shippingAddress: any, paymentDetails: any, totalPrice: number }): Promise<Order> => {
    const payload = {
      items: orderData.items.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
      totalPrice: orderData.totalPrice,
      customerName: orderData.shippingAddress.name,
    };

    const response = await client.post('/orders/', payload);
    const newOrder = mapOrder(response.data);

    await api.processPayment({
      orderId: newOrder.id,
      userId: newOrder.userId,
      amount: newOrder.totalPrice,
      paymentMethod: 'Credit Card'
    });

    return newOrder;
  },

  getRecentOrders: async (sellerId?: string): Promise<Order[]> => {
    const response = await client.get('/orders/');
    return response.data.map(mapOrder);
  },

  processPayment: async (paymentData: { orderId: string, userId: string, amount: number, paymentMethod: string }): Promise<any> => {
    const payload = {
      order: paymentData.orderId,
      user: paymentData.userId,
      amount: paymentData.amount,
      payment_method: paymentData.paymentMethod,
      transaction_id: `tx_${Date.now()}`,
      status: 'completed'
    };
    const response = await client.post('/payments/', payload);
    return response.data;
  },

  // --- Stats ---
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await client.get('/dashboard/stats/');
    return response.data;
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
    const response = await client.get('/users/');
    return response.data.map(mapUser);
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
    // Not implemented in backend MVP
  },

  getPage: async (slug: string): Promise<import('../types').PageContent | undefined> => {
    try {
      const response = await client.get(`/pages/${slug}/`);
      return {
        slug: response.data.slug,
        title: response.data.title,
        content: response.data.content,
        updatedAt: response.data.updated_at
      };
    } catch (e) {
      return undefined;
    }
  },

  getAffiliate: async (): Promise<import('../types').Affiliate | null> => {
    try {
      const response = await client.get('/affiliates/');
      if (response.data.results && response.data.results.length > 0) {
        const data = response.data.results[0];
        return {
          id: data.id,
          userName: data.user_name,
          referralCode: data.referral_code,
          earnings: parseFloat(data.earnings),
          clicks: data.clicks,
          createdAt: data.created_at
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  createAffiliate: async (referralCode: string): Promise<import('../types').Affiliate> => {
    const response = await client.post('/affiliates/', { referral_code: referralCode });
    const data = response.data;
    return {
      id: data.id,
      userName: data.user_name,
      referralCode: data.referral_code,
      earnings: parseFloat(data.earnings),
      clicks: data.clicks,
      createdAt: data.created_at
    };
  }
};