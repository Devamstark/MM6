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

// Helper to ensure absolute URL
const getAbsoluteUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // If it's a relative path starting with /media, prepend the base domain (without /api)
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${url}`;
};

// Helper to map Snake Case (API) to Camel Case (Frontend)
const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: parseFloat(p.price),
  category: p.category,
  subcategory: p.subcategory,
  brand: p.brand,
  imageUrl: getAbsoluteUrl(p.image || p.image_url), // Handle both keys and ensure absolute
  additionalImages: (p.additional_images || []).map(getAbsoluteUrl), // Handle additional images too
  stock: p.stock_quantity,
  gender: p.gender,
  sizes: p.sizes || [],
  colors: p.colors || [],
  isFeatured: p.is_featured,
  isPopular: p.is_popular,
  userId: p.seller,
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

  // --- Password Reset with MFA ---
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      await client.post('/auth/password-reset/request/', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send reset code');
    }
  },

  verifyResetCode: async (email: string, code: string): Promise<void> => {
    try {
      await client.post('/auth/password-reset/verify/', { email, code });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Invalid or expired verification code');
    }
  },

  resetPassword: async (email: string, code: string, newPassword: string): Promise<void> => {
    try {
      await client.post('/auth/password-reset/confirm/', {
        email,
        code,
        new_password: newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to reset password');
    }
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

  createProduct: async (product: Omit<Product, 'id'> & { imageFile?: File }): Promise<Product> => {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price.toString());
    formData.append('category', product.category);
    if (product.subcategory) formData.append('subcategory', product.subcategory);
    formData.append('brand', product.brand);
    formData.append('stock_quantity', product.stock.toString());
    formData.append('gender', product.gender || 'Unisex');

    if (product.sizes) formData.append('sizes', JSON.stringify(product.sizes));
    if (product.colors) formData.append('colors', JSON.stringify(product.colors));

    // File
    if (product.imageFile) {
      formData.append('image', product.imageFile);
    }

    if (product.additionalImages) {
      product.additionalImages.forEach((img) => {
        if (img instanceof File) {
          formData.append('additional_images_files', img);
        } else {
          // If it's a string (URL), we might want to keep it.
          // But for now let's focus on uploading new files.
        }
      });
    }

    formData.append('is_featured', String(product.isFeatured || false));
    formData.append('is_popular', String(product.isPopular || false));

    const response = await client.post('/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapProduct(response.data);
  },

  updateProduct: async (id: string, updates: Partial<Product> & { imageFile?: File }): Promise<Product> => {
    const formData = new FormData();
    if (updates.name) formData.append('name', updates.name);
    if (updates.description) formData.append('description', updates.description);
    if (updates.price) formData.append('price', updates.price.toString());
    if (updates.category) formData.append('category', updates.category);
    if (updates.subcategory) formData.append('subcategory', updates.subcategory);
    if (updates.brand) formData.append('brand', updates.brand);
    if (updates.stock) formData.append('stock_quantity', updates.stock.toString());
    if (updates.gender) formData.append('gender', updates.gender);
    if (updates.sizes) formData.append('sizes', JSON.stringify(updates.sizes));
    if (updates.colors) formData.append('colors', JSON.stringify(updates.colors));
    if (updates.isFeatured !== undefined) formData.append('is_featured', String(updates.isFeatured));
    if (updates.isPopular !== undefined) formData.append('is_popular', String(updates.isPopular));

    // File update
    if (updates.imageFile) {
      formData.append('image', updates.imageFile);
    }

    if (updates.additionalImages) {
      updates.additionalImages.forEach((img) => {
        if (img instanceof File) {
          formData.append('additional_images_files', img);
        }
      });
    }

    const response = await client.patch(`/products/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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