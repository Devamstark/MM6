import axios from 'axios';
import axiosRetry from 'axios-retry';
import { User, Product, AuthResponse, ProductFilter, DashboardStats, Order, SellerStats, ContactMessage, SearchSuggestions, PaginatedResponse, BlogPost } from '../types';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Phase 1C: Automatic Request Retries with Exponential Backoff
axiosRetry(client, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Only retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status && error.response.status >= 500);
  }
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

    // Aggressive cache-busting for all authenticated requests 
    // to prevent "ghost" items from CDNs or browser caches
    // (Headers removed to prevent CORS preflight blocking)
    if (config.method?.toLowerCase() === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
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

// Response Interceptor: Error Logging & Token Refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;
    const url = config?.url;
    const method = config?.method?.toUpperCase();

    if (response) {
      // Handle 401 Unauthorized
      if (response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('cm_refresh');
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(`${API_URL}/auth/refresh/`, {
              refresh: refreshToken,
            });
            const { access } = refreshResponse.data;

            localStorage.setItem('cm_token', access);
            client.defaults.headers.common.Authorization = `Bearer ${access}`;
            originalRequest.headers.Authorization = `Bearer ${access}`;

            processQueue(null, access);
            isRefreshing = false;

            return client(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;

            // Refresh failed - Logout user
            localStorage.removeItem('cm_token');
            localStorage.removeItem('cm_refresh');
            localStorage.removeItem('cm_user_data');

            // For production/VPS: redirect if we're on a path that needs auth
            const protectedPaths = ['/admin', '/dashboard', '/profile', '/checkout', '/orders', '/seller'];
            if (protectedPaths.some(path => window.location.pathname.startsWith(path))) {
              window.location.href = '/login?expired=true';
            }

            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token - logout
          localStorage.removeItem('cm_token');
          localStorage.removeItem('cm_refresh');
          localStorage.removeItem('cm_user_data');
          isRefreshing = false; // CRITICAL FIX: Reset flag so subsequent login attempts don't hang
          // Don't redirect immediately to avoid breaking public page views that just happen to fail on a bg call
        }
      }

      // Phase 1C: Circuit Breaker - Silent fail for non-critical endpoints
      const nonCriticalEndpoints = ['/suggestions', '/analytics', '/recommendations', '/stats', '/health'];
      if (nonCriticalEndpoints.some(ep => url?.includes(ep))) {
        console.warn(`[Circuit Breaker] Suppressed error for non-critical endpoint: ${url}`);
        // Return a mock successful response to prevent frontend crashes
        return Promise.resolve({ data: url?.includes('suggestions') ? { categories: [], products: [] } : [] });
      }

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
export const getAbsoluteUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (url.startsWith('http')) return url;

  // Clean base URL (remove trailing slashes and /api)
  let baseUrl = API_URL.split('/api')[0];
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

  // Clean the relative URL
  let cleanUrl = url;
  if (!cleanUrl.startsWith('/')) cleanUrl = '/' + cleanUrl;

  // If the URL doesn't start with /media/ and doesn't contain it, 
  // we might need to add it if it's a typical Django upload
  if (!cleanUrl.startsWith('/media/') && !cleanUrl.includes('/static/')) {
    // Check if it's likely a media file
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (extensions.some(ext => cleanUrl.toLowerCase().endsWith(ext))) {
      cleanUrl = '/media' + cleanUrl;
    }
  }

  // Final join, ensuring only one slash between them
  return `${baseUrl}${cleanUrl}`;
};

// Helper to map Snake Case (API) to Camel Case (Frontend)
const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  price: parseFloat(p.price),
  category: p.category,
  subcategory: p.subcategory,
  brand: p.brand,
  imageUrl: getAbsoluteUrl(p.image_url || p.image),
  additionalImages: Array.isArray(p.additional_images)
    ? p.additional_images.map(getAbsoluteUrl)
    : (typeof p.additional_images === 'string' ? JSON.parse(p.additional_images).map(getAbsoluteUrl) : []),
  stock: p.stock_quantity,
  gender: p.gender,
  sizes: p.sizes || [],
  colors: p.colors || [],
  isFeatured: p.is_featured,
  isPopular: p.is_popular,
  imageFit: p.image_fit || 'cover',
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
  shippingAddress: o.shipping_address || o.shippingAddress || 'No address provided',
  earningsApplied: o.earnings_applied ? parseFloat(o.earnings_applied) : 0,
  paymentMethod: o.payment_method || 'Credit Card',
  totalPrice: parseFloat(o.total_amount),
  status: o.status,
  createdAt: o.created_at,
  items: (o.items || []).map((i: any) => ({
    id: i.product?.id || i.product,
    name: i.product?.name || i.product_name || 'Unknown Product',
    price: parseFloat(i.price_at_purchase || i.price || 0),
    quantity: i.quantity,
    imageUrl: getAbsoluteUrl(i.product?.image_url || i.product_image),
    userId: i.seller_id // If relevant
  })),
});

// Helper to map BlogPost (API) to Frontend
const mapBlogPost = (p: any): BlogPost => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  excerpt: p.excerpt,
  content: p.content,
  coverImage: getAbsoluteUrl(p.cover_image || p.coverImage),
  author: p.author || p.author_name,
  authorId: p.author_id,
  category: p.category,
  tags: p.tags || [],
  isPublished: p.is_published,
  isFeatured: p.is_featured,
  publishedAt: p.published_at,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
  readingTime: p.reading_time,
  views: p.views,
  imageFit: p.image_fit || 'cover',
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
  referralEarnings: u.referral_earnings !== undefined ? parseFloat(u.referral_earnings) : 0,
  canRedeemEarnings: u.referral_earnings !== undefined ? parseFloat(u.referral_earnings) >= 10 : false,
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
      const response = await client.post('auth/login/', { username: email, password });
      const { access, refresh } = response.data;

      // Store tokens
      localStorage.setItem('cm_token', access);
      localStorage.setItem('cm_refresh', refresh);

      // Fetch User Profile
      const userResponse = await client.get('users/me/');
      const userData = userResponse.data;
      const user = mapUser(userData);

      localStorage.setItem('cm_user_data', JSON.stringify(user));

      return { user, token: access };
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  },

  updateProfile: async (data: FormData): Promise<User> => {
    const response = await client.patch('users/me/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const user = mapUser(response.data);
    localStorage.setItem('cm_user_data', JSON.stringify(user));
    return user;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await client.post('users/change_password/', {
      old_password: oldPassword,
      new_password: newPassword
    });
  },

  deleteSelf: async (): Promise<void> => {
    await client.delete('users/delete_self/');
  },

  exportData: async (): Promise<any> => {
    const response = await client.get('users/export_data/');
    return response.data;
  },

  // --- Addresses ---
  getAddresses: async (): Promise<import('../types').Address[]> => {
    const response = await client.get('addresses/');
    const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
    return data.map((a: any) => ({
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
    const response = await client.post('addresses/', {
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

    const response = await client.patch(`addresses/${id}/`, payload);
    return {
      id: response.data.id,
      ...address
    } as import('../types').Address;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await client.delete(`addresses/${id}/`);
  },

  getUserReviews: async (): Promise<import('../types').Review[]> => {
    const response = await client.get('reviews/my_reviews/');
    const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
    return data.map((r: any) => ({
      id: r.id,
      productId: r.product.id || r.product, // Handle populated or ID
      productName: r.product.name, // If populated
      productImage: getAbsoluteUrl(r.product.image_url || r.product.image), // Ensure absolute URL
      userId: r.user,
      userName: r.user_name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at
    }));
  },

  register: async (name: string, email: string, password: string, role: 'user' | 'seller' = 'user', refCode?: string): Promise<AuthResponse> => {
    // Call Django Register View
    const payload: any = { email, password, role, name };
    if (refCode) payload.ref_code = refCode;
    await client.post('auth/register/', payload);

    // Auto-login after register to get tokens
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
      await client.post('auth/password-reset/request/', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send reset code');
    }
  },

  verifyResetCode: async (email: string, code: string): Promise<void> => {
    try {
      await client.post('auth/password-reset/verify/', { email, code });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Invalid or expired verification code');
    }
  },

  resetPassword: async (email: string, code: string, newPassword: string): Promise<void> => {
    try {
      await client.post('auth/password-reset/confirm/', {
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
      await client.post('inquiries/', { name, email, subject, message });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to submit inquiry');
    }
  },

  // --- Products ---
  getProducts: async (filters: ProductFilter = {}): Promise<PaginatedResponse<Product>> => {
    const params: any = {};
    if (filters.category) params.category = filters.category;
    if (filters.subcategory) params.subcategory = filters.subcategory;
    if (filters.brand) params.brand = filters.brand;
    if (filters.sellerId) params.seller = filters.sellerId;
    if (filters.search) params.search = filters.search;
    if (filters.onSale) params.on_sale = 'true';
    if (filters.page) params.page = filters.page;

    if (filters.minPrice !== undefined) params.min_price = filters.minPrice;
    if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice;

    if (filters.isFeatured !== undefined) params.is_featured = filters.isFeatured;
    if (filters.isPopular !== undefined) params.is_popular = filters.isPopular;

    if (filters.sort) {
      if (filters.sort === 'price_asc') params.ordering = 'price';
      else if (filters.sort === 'price_desc') params.ordering = '-price';
      else if (filters.sort === 'newest') params.ordering = '-created_at';
    }

    const response = await client.get('products/', { params });

    // Handle both paginated and non-paginated responses for safety
    if (response.data.results && Array.isArray(response.data.results)) {
      return {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: response.data.results.map(mapProduct)
      };
    }

    return {
      count: response.data.length || 0,
      next: null,
      previous: null,
      results: Array.isArray(response.data) ? response.data.map(mapProduct) : []
    };
  },

  getProduct: async (id: string): Promise<Product | undefined> => {
    try {
      const response = await client.get(`products/${id}/`);
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
      product.additionalImages.filter(img => img).forEach((img) => {
        if (img instanceof File) {
          formData.append('additional_images_files', img);
        } else if (typeof img === 'string' && img.trim() !== '') {
          formData.append('additional_images', img);
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

    const response = await client.post('products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapProduct(response.data);
  },

  getSuggestions: async (query: string): Promise<SearchSuggestions> => {
    try {
      const response = await client.get(`products/suggestions/?q=${query}`);
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
    const response = await client.post('products/bulk_upload/', formData, {
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
      updates.additionalImages.filter(img => img).forEach((img) => {
        if (img instanceof File) {
          formData.append('additional_images_files', img);
        } else if (typeof img === 'string' && img.trim() !== '') {
          formData.append('additional_images', img);
        }
      });
    }

    const response = await client.patch(`products/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return mapProduct(response.data);
  },

  reorderProducts: async (items: { id: string; display_order: number }[]) => {
    const response = await client.post('products/reorder/', { items });
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await client.delete(`products/${id}/`);
  },

  getCategories: async (): Promise<string[]> => {
    // Use the dedicated categories endpoint that returns distinct category data
    try {
      const response = await client.get('categories/');
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return Object.keys(response.data);
      }
    } catch (e) {
      // fallback
    }
    // Fallback: fetch products with large page_size
    const response = await client.get('products/', { params: { page_size: 200 } });
    const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
    const categories = new Set(data.filter((p: any) => p.category).map((p: any) => p.category));
    return Array.from(categories) as string[];
  },

  getBrands: async (): Promise<string[]> => {
    const response = await client.get('products/?limit=100');
    const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
    const brands = new Set(data.filter((p: any) => p.brand).map((p: any) => p.brand));
    return Array.from(brands) as string[];
  },

  getSubcategories: async (category?: string): Promise<string[]> => {
    const response = await client.get(`products/?limit=100${category ? `&category=${encodeURIComponent(category)}` : ''}`);
    const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
    const subcats = new Set<string>();
    data.forEach((p: any) => {
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
      const response = await client.get(`reviews/?product=${productId}`);
      const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
      return data.map((r: any) => ({
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
      const response = await client.post('reviews/', {
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
  createOrder: async (orderData: { items: any[], shippingAddress: any, paymentDetails?: any, totalPrice: number, useEarnings?: boolean, couponCode?: string, transactionId?: string }): Promise<Order> => {
    const payload = {
      items: orderData.items.map(i => ({ id: i.id, quantity: parseInt(i.quantity), price: parseFloat(i.price) })),
      totalPrice: orderData.totalPrice,
      customerName: orderData.shippingAddress?.name || '',
      shipping_address: orderData.shippingAddress
        ? (typeof orderData.shippingAddress === 'string'
          ? orderData.shippingAddress
          : `${orderData.shippingAddress.name || ''}\n${orderData.shippingAddress.address || ''}\n${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.zip || ''}`.trim())
        : '',
      use_earnings: orderData.useEarnings || false,
      coupon_code: orderData.couponCode,
    };

    const response = await client.post('orders/', payload);
    const newOrder = mapOrder(response.data);

    await api.processPayment({
      orderId: newOrder.id,
      userId: newOrder.userId,
      amount: newOrder.totalPrice,
      paymentMethod: 'Stripe',
      transactionId: orderData.transactionId || `tx_${Date.now()}`
    });

    return newOrder;
  },

  getRecentOrders: async (sellerId?: string): Promise<any> => {
    const response = await client.get('orders/', { params: { page_size: 200 } });
    // Return raw paginated response so AdminDashboard can access .results and .next
    if (response.data.results && Array.isArray(response.data.results)) {
      return {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: response.data.results.map(mapOrder),
      };
    }
    // Fallback for non-paginated
    const data = Array.isArray(response.data) ? response.data : [];
    return { count: data.length, next: null, previous: null, results: data.map(mapOrder) };
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await client.get('orders/my_orders/');
    const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
    return data.map(mapOrder);
  },

  getOrderDetails: async (id: string): Promise<Order> => {
    const response = await client.get(`orders/${id}/`);
    return mapOrder(response.data);
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await client.patch(`orders/${id}/`, { status });
    return mapOrder(response.data);
  },

  processPayment: async (paymentData: { orderId: string, userId: string, amount: number, paymentMethod: string, transactionId?: string }): Promise<any> => {
    const payload = {
      order: paymentData.orderId,
      user: paymentData.userId,
      amount: paymentData.amount,
      payment_method: paymentData.paymentMethod,
      transaction_id: paymentData.transactionId || `tx_${Date.now()}`,
      status: 'completed'
    };
    const response = await client.post('payments/', payload);
    return response.data;
  },

  // --- Stats ---
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await client.get('dashboard/stats/');
    return response.data;
  },

  getSellerStats: async (sellerId: string): Promise<SellerStats> => {
    const response = await client.get(`/users/${sellerId}/seller_stats/`);
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await client.get('users/');
    const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
    return data.map(mapUser);
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
    await client.patch(`users/${userId}/`, { is_active: isActive });
  },

  updateUser: async (userId: string, data: any): Promise<any> => {
    const response = await client.patch(`users/${userId}/`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await client.delete(`users/${userId}/`);
  },

  createPaymentIntent: async (items: any[], couponCode?: string, useEarnings: boolean = false): Promise<{ clientSecret: string; totalAmount: number }> => {
    const response = await client.post('payments/create-payment-intent/', {
      items,
      couponCode,
      useEarnings
    });
    return response.data;
  },

  getMyEarnings: async (): Promise<{ referralEarnings: number; canRedeem: boolean; minimumToRedeem: number }> => {
    try {
      const response = await client.get('users/my_earnings/');
      return {
        referralEarnings: parseFloat(response.data.referral_earnings),
        canRedeem: response.data.can_redeem,
        minimumToRedeem: parseFloat(response.data.minimum_to_redeem),
      };
    } catch {
      return { referralEarnings: 0, canRedeem: false, minimumToRedeem: 10 };
    }
  },



  getAffiliate: async (): Promise<import('../types').Affiliate | null> => {
    try {
      const response = await client.get('affiliates/');
      // Handle both paginated (response.data.results) and non-paginated (response.data) responses
      const results = Array.isArray(response.data) ? response.data : (response.data.results || []);

      if (results && results.length > 0) {
        const data = results[0];
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
    const response = await client.post('affiliates/', { referral_code: referralCode });
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
      const response = await client.get('wishlist/');
      const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
      return data.map((item: any) => mapProduct(item.product));
    } catch (e) {
      return [];
    }
  },

  toggleWishlist: async (productId: string): Promise<boolean> => {
    // Returns true if added, false if removed
    const response = await client.post('wishlist/toggle/', { product_id: productId });
    return response.data.in_wishlist;
  },

  // --- Contact Messages ---
  getContactMessages: async (): Promise<ContactMessage[]> => {
    const response = await client.get('contact-messages/');
    const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : response.data;
    if (!Array.isArray(data)) return [];
    return data.map((m: any) => ({
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
    await client.post(`contact-messages/${id}/mark_as_read/`);
  },

  deleteContactMessage: async (id: string): Promise<void> => {
    await client.delete(`contact-messages/${id}/`);
  },

  // --- Coupons ---
  getCoupons: async (): Promise<any[]> => {
    const response = await client.get('coupons/');
    return response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
  },

  validateCoupon: async (code: string, cartTotal: number): Promise<{ valid: boolean; discount: number; message?: string; coupon?: any }> => {
    try {
      const response = await client.post('coupons/validate/', { code, cart_total: cartTotal });
      return {
        valid: true,
        discount: parseFloat(response.data.discount),
        coupon: response.data.coupon
      };
    } catch (error: any) {
      return {
        valid: false,
        discount: 0,
        message: error.response?.data?.message || error.response?.data?.error || 'Invalid coupon code'
      };
    }
  },

  createCoupon: async (data: any): Promise<any> => {
    const response = await client.post('coupons/', data);
    return response.data;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    await client.delete(`coupons/${id}/`);
  },

  updateCoupon: async (id: string, data: any): Promise<any> => {
    const response = await client.patch(`coupons/${id}/`, data);
    return response.data;
  },

  // --- CMS (Hero Banners & Home Sections) ---
  getHeroBanners: async (): Promise<any[]> => {
    const response = await client.get('hero-banners/');
    const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
    return data.map((b: any) => ({
      ...b,
      image: getAbsoluteUrl(b.image)
    }));
  },

  createHeroBanner: async (data: any): Promise<any> => {
    const response = await client.post('hero-banners/', data);
    return response.data;
  },

  updateHeroBanner: async (id: string, data: any): Promise<any> => {
    const response = await client.patch(`hero-banners/${id}/`, data);
    return response.data;
  },

  deleteHeroBanner: async (id: string): Promise<void> => {
    await client.delete(`hero-banners/${id}/`);
  },

  getHomeSections: async (): Promise<any[]> => {
    const response = await client.get('home-sections/');
    const data = response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
    return data.map((s: any) => ({
      ...s,
      image: getAbsoluteUrl(s.image),
      // If images is a JSON string of URLs
      images: s.images ? (typeof s.images === 'string' ? JSON.parse(s.images).map(getAbsoluteUrl) : s.images.map(getAbsoluteUrl)) : []
    }));
  },

  createHomeSection: async (data: any): Promise<any> => {
    const response = await client.post('home-sections/', data);
    return response.data;
  },

  updateHomeSection: async (id: string, data: any): Promise<any> => {
    const response = await client.patch(`home-sections/${id}/`, data);
    return response.data;
  },

  deleteHomeSection: async (id: string): Promise<void> => {
    await client.delete(`home-sections/${id}/`);
  },
  // -- Blog --
  uploadBlogImage: async (file: File): Promise<{ url: string; filename: string; size: number; content_type: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await client.post('blog/upload-image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getBlogPosts: async (params) => {
    const response = await client.get('blog/', { params });
    const data = response.data.results && Array.isArray(response.data.results)
      ? response.data.results
      : Array.isArray(response.data) ? response.data : [];
    return data.map(mapBlogPost);
  },
  getBlogPost: async (slug) => {
    const response = await client.get(`blog/${slug}/`);
    return mapBlogPost(response.data);
  },
  createBlogPost: async (data) => {
    const isForm = data instanceof FormData;
    const response = await client.post('blog/', data, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },
  updateBlogPost: async (id, data) => {
    const isForm = data instanceof FormData;
    const response = await client.patch(`blog/${id}/`, data, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },
  deleteBlogPost: async (id) => { await client.delete(`blog/${id}/`); },
  publishBlogPost: async (id: string, publish: boolean = true) => {
    const response = await client.patch(`blog/${id}/publish/`, { is_published: publish });
    return response.data;
  },

  // --- Newsletter ---
  subscribeToNewsletter: async (email: string): Promise<any> => {
    const response = await client.post('newsletter/', { email });
    return response.data;
  },

  // --- Marketing Campaigns (Enterprise) ---
  getCampaigns: async (params?: Record<string, string>): Promise<any[]> => {
    const response = await client.get('marketing-campaigns/', { params });
    return response.data.results && Array.isArray(response.data.results) ? response.data.results : (Array.isArray(response.data) ? response.data : []);
  },

  createCampaign: async (data: any): Promise<any> => {
    const response = await client.post('marketing-campaigns/', data);
    return response.data;
  },

  updateCampaign: async (id: string, data: any): Promise<any> => {
    const response = await client.patch(`marketing-campaigns/${id}/`, data);
    return response.data;
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await client.delete(`marketing-campaigns/${id}/`);
  },

  sendCampaign: async (id: string, sendNow: boolean = true): Promise<any> => {
    const response = await client.post(`marketing-campaigns/${id}/send/`, { send_now: sendNow });
    return response.data;
  },

  pauseCampaign: async (id: string): Promise<any> => {
    const response = await client.post(`marketing-campaigns/${id}/pause/`);
    return response.data;
  },

  resumeCampaign: async (id: string): Promise<any> => {
    const response = await client.post(`marketing-campaigns/${id}/resume/`);
    return response.data;
  },

  duplicateCampaign: async (id: string): Promise<any> => {
    const response = await client.post(`marketing-campaigns/${id}/duplicate/`);
    return response.data;
  },

  getCampaignLogs: async (id: string, logStatus?: string): Promise<any> => {
    const params: Record<string, string> = {};
    if (logStatus) params.log_status = logStatus;
    const response = await client.get(`marketing-campaigns/${id}/logs/`, { params });
    return response.data;
  },

  getMarketingAnalytics: async (): Promise<any> => {
    const response = await client.get('marketing-campaigns/analytics/');
    return response.data;
  },

  getCampaignCalendar: async (year: number, month: number): Promise<any> => {
    const response = await client.get('marketing-campaigns/calendar/', {
      params: { year, month }
    });
    return response.data;
  },

  getAudiencePreview: async (audienceType: string, audienceDays?: number, manualUserIds?: string[]): Promise<any> => {
    const params: Record<string, string> = { audience_type: audienceType };
    if (audienceDays) params.audience_days = String(audienceDays);
    if (manualUserIds?.length) params.manual_user_ids = manualUserIds.join(',');
    const response = await client.get('marketing-campaigns/audience-preview/', { params });
    return response.data;
  },

  getMarketingUsersList: async (): Promise<any[]> => {
    const response = await client.get('marketing-campaigns/users-list/');
    return response.data;
  },

  // --- Conversion Tracking ---
  getCampaignConversionAnalytics: async (campaignId: string): Promise<any> => {
    const response = await client.get(`marketing-campaigns/${campaignId}/conversion-analytics/`);
    return response.data;
  },

  trackEmailClick: async (campaignId: string, userId: string, email: string, url: string): Promise<any> => {
    const response = await client.post(`marketing-campaigns/${campaignId}/track-click/`, {
      user_id: userId,
      email,
      url,
    });
    return response.data;
  },

  trackEmailConversion: async (campaignId: string, userId: string, conversionValue: number, orderId?: string, clickId?: string): Promise<any> => {
    const response = await client.post(`marketing-campaigns/${campaignId}/track-conversion/`, {
      user_id: userId,
      order_id: orderId,
      conversion_value: conversionValue,
      click_id: clickId,
    });
    return response.data;
  },
};