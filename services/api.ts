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
  brand: p.brand,
  imageUrl: p.image_url,
  stock: p.stock_quantity,
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
    id: i.product.id,
    name: i.product.name,
    price: parseFloat(i.price_at_purchase),
    quantity: i.quantity,
    imageUrl: i.product.image_url,
  })),
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

      // Map backend user to frontend user type
      // Ensure 'name' exists to avoid charAt() errors in frontend
      const user = {
        ...userData,
        name: userData.first_name ? `${userData.first_name} ${userData.last_name}`.trim() : (userData.username || userData.email)
      };

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
      brand: product.brand,
      stock_quantity: product.stock,
      image_url: product.imageUrl,
      is_featured: product.isFeatured || false,
      is_popular: product.isPopular || false,
    };
    const response = await client.post('/products/', formData);
    return mapProduct(response.data);
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const formData: any = {};
    if (updates.name) formData.name = updates.name;
    if (updates.price) formData.price = updates.price;
    if (updates.stock) formData.stock_quantity = updates.stock;
    // ... map others as needed

    const response = await client.patch(`/products/${id}/`, formData);
    return mapProduct(response.data);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await client.delete(`/products/${id}/`);
  },

  getCategories: async (): Promise<string[]> => {
    // Helper to get unique categories. 
    // In a real app, use a distinct endpoint. 
    // Here we fetch all and filter (inefficient but works for capstone scale)
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
      customerName: orderData.shippingAddress.name, // passed to backend
    };

    // 1. Create Order
    const response = await client.post('/orders/', payload);
    const newOrder = mapOrder(response.data);

    // 2. Process Payment (Mock/API)
    await api.processPayment({
      orderId: newOrder.id,
      userId: newOrder.userId,
      amount: newOrder.totalPrice,
      paymentMethod: 'Credit Card'
    });

    return newOrder;
  },

  getRecentOrders: async (sellerId?: string): Promise<Order[]> => {
    // If sellerId is passed, the backend OrderViewSet should handle filtering via query params if implemented
    // For now, we just fetch '/orders/' which returns 'my' orders or 'all' if admin.
    const response = await client.get('/orders/');
    return response.data.map(mapOrder);
  },

  processPayment: async (paymentData: { orderId: string, userId: string, amount: number, paymentMethod: string }): Promise<any> => {
    // Call the Payment Endpoint
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
    // Mocking for now as backend endpoint isn't strictly defined in the minimal plan
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
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
    // Not implemented in backend MVP
  }
};