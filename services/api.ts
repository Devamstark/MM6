import axios from 'axios';
import { User, Product, AuthResponse, ProductFilter, DashboardStats, Order, SellerStats, ContactMessage, SearchSuggestions } from '../types';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get cookie by name
const getCookie = (name: string) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Request Interceptor: Auth & CSRF
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add CSRF Token for mutation methods
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    const csrfToken = getCookie('csrftoken'); // Django default name
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }

  return config;
});

// Response Interceptor: Error Logging
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    const url = config?.url;
    const method = config?.method?.toUpperCase();

    if (response) {
      // Server responded with error status
      console.error(`[API Error] ${method} ${url}`, {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
    } else if (error.request) {
      // Request made but no response
      console.error(`[API Network Error] ${method} ${url}`, error.request);
    } else {
      // Setup error
      console.error(`[API Setup Error] ${error.message}`);
    }

    return Promise.reject(error);
  }
);

// Helper to ensure absolute URL
const getAbsoluteUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // If it's a relative path starting with /media, prepend the base domain (without /api)
  const baseUrl = API_URL.replace('/api', '');
  // Ensure we don't have double slashes or missing slashes
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
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
  variants: p.variants || [],
  userId: p.seller,
  createdAt: p.created_at,
  discountPercentage: p.discount_percentage,
  salePrice: p.sale_price ? parseFloat(p.sale_price) : undefined,
  cogs: p.cogs ? parseFloat(p.cogs) : undefined,
  marketingCost: p.marketing_cost ? parseFloat(p.marketing_cost) : undefined,
  shippingCost: p.shipping_cost ? parseFloat(p.shipping_cost) : undefined,
  flashSaleStart: p.flash_sale_start,
  flashSaleEnd: p.flash_sale_end,
});

const mapOrder = (o: any): Order => ({
  id: o.id,
  userId: o.user,
  customerName: o.customer_name || 'Unknown Guest',
  email: o.user_email || o.shipping_info?.email || 'N/A', // Try to infer email
  shippingAddress: o.shipping_address || 'No address provided',
  paymentMethod: o.payment_method || 'Credit Card',
  totalPrice: parseFloat(o.total_amount),
  status: o.status,
  createdAt: o.created_at,
  items: (o.items || []).map((i: any) => ({
    id: i.product?.id || i.product,
    name: i.product?.name || i.product_name || 'Unknown Product',
    price: parseFloat(i.price_at_purchase || i.price || 0),
    quantity: i.quantity,
    imageUrl: i.product?.image_url || i.product_image,
    userId: i.seller_id // If relevant
  })),
});

// Helper to map User (API) to Frontend
const mapUser = (u: any): User => ({
  id: u.id,
  name: u.first_name ? `${u.first_name} ${u.last_name}`.trim() : (u.username || u.email),
  firstName: u.first_name,
  lastName: u.last_name,
  email: u.email,
  phoneNumber: u.phone_number,
  profilePicture: u.profile_picture && u.profile_picture.startsWith('data:') ? u.profile_picture : (u.profile_picture ? getAbsoluteUrl(u.profile_picture) : undefined),
  role: u.role,
  bio: u.bio,
  bonusPoints: u.bonus_points || 0,
  isActive: u.is_active,
  createdAt: u.date_joined,
  lastLogin: u.last_login,
  token: u.token, // preserved if exists
  addresses: (u.addresses || []).map((a: any) => ({
    id: a.id,
    fullName: a.full_name,
    street: a.street,
    city: a.city,
    state: a.state,
    postalCode: a.postal_code,
    country: a.country,
    phone: a.phone,
    isDefault: a.is_default,
    type: a.type
  }))
});

export const api = {
  // --- Auth & User Profile ---
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

  updateProfile: async (data: FormData): Promise<User> => {
    const response = await client.patch('/users/me/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const user = mapUser(response.data);
    localStorage.setItem('cm_user_data', JSON.stringify(user));
    return user;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await client.post('/users/change_password/', {
      old_password: oldPassword,
      new_password: newPassword
    });
  },

  // --- Addresses ---
  getAddresses: async (): Promise<import('../types').Address[]> => {
    const response = await client.get('/addresses/');
    return response.data.map((a: any) => ({
      id: a.id,
      fullName: a.full_name,
      street: a.street,
      city: a.city,
      state: a.state,
      postalCode: a.postal_code,
      country: a.country,
      phone: a.phone,
      isDefault: a.is_default,
      type: a.type
    }));
  },

  addAddress: async (address: Omit<import('../types').Address, 'id'>): Promise<import('../types').Address> => {
    const response = await client.post('/addresses/', {
      full_name: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postalCode,
      country: address.country,
      phone: address.phone,
      is_default: address.isDefault,
      type: address.type
    });
    return {
      id: response.data.id,
      ...address
    };
  },

  updateAddress: async (id: string, address: Partial<import('../types').Address>): Promise<import('../types').Address> => {
    const payload: any = {};
    if (address.fullName) payload.full_name = address.fullName;
    if (address.street) payload.street = address.street;
    if (address.city) payload.city = address.city;
    if (address.state) payload.state = address.state;
    if (address.postalCode) payload.postal_code = address.postalCode;
    if (address.country) payload.country = address.country;
    if (address.phone) payload.phone = address.phone;
    if (address.isDefault !== undefined) payload.is_default = address.isDefault;
    if (address.type) payload.type = address.type;

    const response = await client.patch(`/addresses/${id}/`, payload);
    return {
      id: response.data.id,
      ...address
    } as import('../types').Address;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await client.delete(`/addresses/${id}/`);
  },

  getUserReviews: async (): Promise<import('../types').Review[]> => {
    const response = await client.get('/reviews/my_reviews/'); // Assuming endpoint
    return response.data.map((r: any) => ({
      id: r.id,
      productId: r.product.id || r.product, // Handle populated or ID
      productName: r.product.name, // If populated
      productImage: r.product.image, // If populated
      userId: r.user,
      userName: r.user_name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at
    }));
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

  submitInquiry: async (name: string, email: string, subject: string, message: string): Promise<void> => {
    try {
      await client.post('/inquiries/', { name, email, subject, message });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to submit inquiry');
    }
  },

  // --- Products ---
  getProducts: async (filters: ProductFilter = {}): Promise<Product[]> => {
    const params: any = {};
    if (filters.category) params.category = filters.category;
    if (filters.subcategory) params.subcategory = filters.subcategory;
    if (filters.brand) params.brand = filters.brand;
    if (filters.sellerId) params.seller = filters.sellerId;
    if (filters.search) params.search = filters.search;
    if (filters.onSale) params.on_sale = 'true';

    if (filters.minPrice !== undefined) params.min_price = filters.minPrice;
    if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice;

    if (filters.isFeatured !== undefined) params.is_featured = filters.isFeatured;
    if (filters.isPopular !== undefined) params.is_popular = filters.isPopular;

    if (filters.sort) {
      if (filters.sort === 'price_asc') params.ordering = 'price';
      else if (filters.sort === 'price_desc') params.ordering = '-price';
      else if (filters.sort === 'newest') params.ordering = '-created_at';
    }

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

  createProduct: async (product: Omit<Product, 'id' | 'additionalImages' | 'userId' | 'createdAt'> & { imageFile?: File, additionalImages?: (string | File)[] }): Promise<Product> => {
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

    // Variants
    if (product.variants) formData.append('variants', JSON.stringify(product.variants));

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
    formData.append('cogs', product.cogs?.toString() || '0');
    formData.append('marketing_cost', product.marketingCost?.toString() || '0');
    formData.append('shipping_cost', product.shippingCost?.toString() || '0');
    if (product.flashSaleStart) formData.append('flash_sale_start', product.flashSaleStart);
    if (product.flashSaleEnd) formData.append('flash_sale_end', product.flashSaleEnd);

    const response = await client.post('/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapProduct(response.data);
  },

  getSuggestions: async (query: string): Promise<SearchSuggestions> => {
    try {
      const response = await client.get(`/products/suggestions/?q=${query}`);
      return {
        categories: response.data.categories || [],
        products: (response.data.products || []).map(mapProduct)
      };
    } catch {
      return { categories: [], products: [] };
    }
  },

  bulkUploadProducts: async (zipFile: File): Promise<{ message: string; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', zipFile);
    const response = await client.post('/products/bulk_upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  client,

  updateProduct: async (id: string, updates: Partial<Omit<Product, 'additionalImages'>> & { imageFile?: File, additionalImages?: (string | File)[] }): Promise<Product> => {
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
    if (updates.variants) formData.append('variants', JSON.stringify(updates.variants));
    if (updates.isFeatured !== undefined) formData.append('is_featured', String(updates.isFeatured));
    if (updates.isPopular !== undefined) formData.append('is_popular', String(updates.isPopular));
    if (updates.discountPercentage !== undefined) formData.append('discount_percentage', updates.discountPercentage.toString());
    if (updates.cogs !== undefined) formData.append('cogs', updates.cogs.toString());
    if (updates.marketingCost !== undefined) formData.append('marketing_cost', updates.marketingCost.toString());
    if (updates.shippingCost !== undefined) formData.append('shipping_cost', updates.shippingCost.toString());
    if (updates.flashSaleStart !== undefined) formData.append('flash_sale_start', updates.flashSaleStart);
    if (updates.flashSaleEnd !== undefined) formData.append('flash_sale_end', updates.flashSaleEnd);

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

  reorderProducts: async (items: { id: string; display_order: number }[]) => {
    const response = await client.post('/products/reorder/', { items });
    return response.data;
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

  getSubcategories: async (category?: string): Promise<string[]> => {
    const response = await client.get('/products/');
    const products = response.data;
    const subcats = new Set<string>();
    products.forEach((p: any) => {
      if (p.subcategory) {
        if (!category || p.category === category) {
          subcats.add(p.subcategory);
        }
      }
    });
    return Array.from(subcats) as string[];
  },

  // --- Reviews ---
  getReviews: async (productId: string): Promise<import('../types').Review[]> => {
    try {
      // Filter by product
      const response = await client.get(`/reviews/?product=${productId}`);
      return response.data.map((r: any) => ({
        id: r.id,
        productId: r.product,
        userId: r.user,
        userName: r.user_name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at
      }));
    } catch (e) {
      return [];
    }
  },

  createReview: async (productId: string, rating: number, comment: string, user: User): Promise<import('../types').Review> => {
    try {
      const response = await client.post('/reviews/', {
        product: productId,
        rating,
        comment
      });
      const r = response.data;
      return {
        id: r.id,
        productId: r.product,
        userId: r.user,
        userName: r.user_name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at
      };
    } catch (e: any) {
      // Pass the permission error detail if available
      throw new Error(e.response?.data?.detail || e.message || 'Failed to submit review');
    }
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

  getMyOrders: async (): Promise<Order[]> => {
    const response = await client.get('/orders/my_orders/');
    return response.data.map(mapOrder);
  },

  getOrderDetails: async (id: string): Promise<Order> => {
    const response = await client.get(`/orders/${id}/`);
    return mapOrder(response.data);
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await client.patch(`/orders/${id}/`, { status });
    return mapOrder(response.data);
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
  },

  // --- Wishlist ---
  getWishlist: async (): Promise<Product[]> => {
    try {
      const response = await client.get('/wishlist/');
      return response.data.map((item: any) => mapProduct(item.product));
    } catch (e) {
      return [];
    }
  },

  toggleWishlist: async (productId: string): Promise<boolean> => {
    // Returns true if added, false if removed
    const response = await client.post('/wishlist/toggle/', { product_id: productId });
    return response.data.in_wishlist;
  },

  // --- Contact Messages ---
  getContactMessages: async (): Promise<ContactMessage[]> => {
    const response = await client.get('/contact-messages/');
    return response.data.map((m: any) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      isRead: m.is_read,
      createdAt: m.created_at
    }));
  },

  markMessageAsRead: async (id: string): Promise<void> => {
    await client.post(`/contact-messages/${id}/mark_as_read/`);
  },

  deleteContactMessage: async (id: string): Promise<void> => {
    await client.delete(`/contact-messages/${id}/`);
  }
};
