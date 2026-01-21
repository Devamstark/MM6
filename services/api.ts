import { User, Product, AuthResponse, ProductFilter, DashboardStats, Order, SellerStats } from '../types';

// ============================================================================
// MOCK DATA & STORAGE (For Preview Environment Only)
// ============================================================================

const MOCK_DELAY = 800; // Increased delay to simulate payment processing
const STORAGE_KEYS = {
  USERS: 'cm_users',
  PRODUCTS: 'cm_products',
  TOKEN: 'cm_token',
  USER: 'cm_user_data',
  ORDERS: 'cm_orders',
  PAYMENTS: 'cm_payments'
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1, userId: 1, name: "Sony WH-1000XM5 Headphones", description: "Industry-leading noise canceling.", price: 348.00, category: "Electronics", brand: "Sony", imageUrl: "https://picsum.photos/400/400?random=1", stock: 50, isFeatured: true, isPopular: true
  },
  {
    id: 2, userId: 1, name: "Herman Miller Aeron Chair", description: "The gold standard of office seating.", price: 1250.00, category: "Furniture", brand: "Herman Miller", imageUrl: "https://picsum.photos/400/400?random=2", stock: 20, isFeatured: false, isPopular: true
  },
  {
    id: 3, userId: 2, name: "Keychron K2 Mechanical Keyboard", description: "Wireless mechanical keyboard.", price: 89.99, category: "Electronics", brand: "Keychron", imageUrl: "https://picsum.photos/400/400?random=3", stock: 15, isFeatured: false, isPopular: false
  }
];

const INITIAL_USERS: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@cloudmart.com', role: 'admin', isActive: true, createdAt: '2023-01-01' },
  { id: 2, name: 'Best Seller Inc.', email: 'seller@cloudmart.com', role: 'seller', isActive: true, createdAt: '2023-02-15' },
  { id: 3, name: 'John Doe', email: 'john@example.com', role: 'user', isActive: true, createdAt: '2023-03-10' },
  { id: 4, name: 'Jane Smith', email: 'jane@example.com', role: 'user', isActive: true, createdAt: '2023-03-12' },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 101, userId: 3, customerName: 'John Doe', totalPrice: 348.00, status: 'delivered', createdAt: '2023-10-01',
    items: [INITIAL_PRODUCTS[0]]
  },
  {
    id: 102, userId: 4, customerName: 'Jane Smith', totalPrice: 89.99, status: 'shipped', createdAt: '2023-10-02',
    items: [INITIAL_PRODUCTS[2]]
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStoredProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(stored);
};

const setStoredProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  return JSON.parse(stored);
};

const setStoredUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

const getStoredOrders = (): Order[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  return JSON.parse(stored);
};

const setStoredOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

const getStoredPayments = (): any[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return stored ? JSON.parse(stored) : [];
};

const setStoredPayments = (payments: any[]) => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};

// ============================================================================
// API SERVICE
// ============================================================================

export const api = {
  // --- Auth ---
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(MOCK_DELAY);
    const users = getStoredUsers();

    let user: User | undefined;
    if (email === 'admin@cloudmart.com' && password === 'admin') user = users.find(u => u.email === email);
    else if (email === 'seller@cloudmart.com' && password === 'seller') user = users.find(u => u.email === email);
    else if (password === 'password') user = users.find(u => u.email === email);

    if (user) {
      if (user.isActive === false) throw new Error('Account is disabled. Contact admin.');

      const token = `mock-jwt-token-${user.role}`;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { user, token };
    }

    throw new Error('Invalid credentials.');
  },

  register: async (name: string, email: string, password: string, role: 'user' | 'seller' = 'user'): Promise<AuthResponse> => {
    await delay(MOCK_DELAY);
    const users = getStoredUsers();
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      role,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    setStoredUsers(users);

    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock-jwt-token-new');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    return { user: newUser, token: 'mock-jwt-token-new' };
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // --- Products ---
  getProducts: async (filters: ProductFilter = {}): Promise<Product[]> => {
    await delay(400); // Shorter delay for read ops
    let products = getStoredProducts();

    if (filters.sellerId) products = products.filter(p => p.userId === filters.sellerId);
    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(lowerSearch) || p.description.toLowerCase().includes(lowerSearch));
    }
    if (filters.category) products = products.filter(p => p.category === filters.category);
    if (filters.brand) products = products.filter(p => p.brand === filters.brand);
    if (filters.minPrice !== undefined) products = products.filter(p => p.price >= filters.minPrice!);
    if (filters.maxPrice !== undefined) products = products.filter(p => p.price <= filters.maxPrice!);
    if (filters.isFeatured) products = products.filter(p => p.isFeatured);
    if (filters.isPopular) products = products.filter(p => p.isPopular);

    if (filters.sort) {
      products = [...products].sort((a, b) => {
        if (filters.sort === 'price_asc') return a.price - b.price;
        if (filters.sort === 'price_desc') return b.price - a.price;
        return 0;
      });
    }
    return products;
  },

  getProduct: async (id: number): Promise<Product | undefined> => {
    await delay(400);
    return getStoredProducts().find(p => p.id === id);
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    await delay(MOCK_DELAY);
    const products = getStoredProducts();
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const currentUser = storedUser ? JSON.parse(storedUser) : { id: 1 };

    const newProduct = {
      ...product,
      id: Date.now(),
      userId: currentUser.id,
      brand: product.brand || 'Generic',
      isFeatured: product.isFeatured || false,
      isPopular: product.isPopular || false
    };
    products.push(newProduct);
    setStoredProducts(products);
    return newProduct;
  },

  updateProduct: async (id: number, updates: Partial<Product>): Promise<Product> => {
    await delay(MOCK_DELAY);
    let products = getStoredProducts();
    let updatedProduct: Product | undefined;
    products = products.map(p => {
      if (p.id === id) {
        updatedProduct = { ...p, ...updates };
        return updatedProduct;
      }
      return p;
    });
    if (!updatedProduct) throw new Error("Product not found");
    setStoredProducts(products);
    return updatedProduct;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await delay(MOCK_DELAY);
    const products = getStoredProducts().filter(p => p.id !== id);
    setStoredProducts(products);
  },

  getCategories: async (): Promise<string[]> => {
    await delay(400);
    const products = getStoredProducts();
    const categories = Array.from(new Set(products.map(p => p.category)));
    return categories.sort();
  },

  getBrands: async (): Promise<string[]> => {
    await delay(400);
    const products = getStoredProducts();
    const brands = Array.from(new Set(products.map(p => p.brand)));
    return brands.sort();
  },

  // --- Orders & Checkout ---
  createOrder: async (orderData: { items: any[], shippingAddress: any, paymentDetails: any, totalPrice: number }): Promise<Order> => {
    await delay(1500); // Simulate Payment Gateway Processing Time
    const orders = getStoredOrders();
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const currentUser = storedUser ? JSON.parse(storedUser) : { id: 999, name: 'Guest' };

    // Format items to look like Product[] so dashboards can display them easily
    // In a real app, this would be a JOIN query
    const newOrder: Order = {
      id: Date.now(),
      userId: currentUser.id,
      customerName: currentUser.name,
      totalPrice: orderData.totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      shippingAddress: `${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}`,
      items: orderData.items // Preserves the full product object including userId for seller filtering
    };

    orders.unshift(newOrder); // Add to top of list
    setStoredOrders(orders);

    // Decrease stock (mock logic)
    const products = getStoredProducts();
    orderData.items.forEach((item: any) => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        product.stock = Math.max(0, product.stock - (item.quantity || 1));
      }
    });
    setStoredProducts(products);

    // Process Payment automatically for this mock
    await api.processPayment({
      orderId: newOrder.id,
      amount: newOrder.totalPrice,
      paymentMethod: 'Credit Card',
      cardDetails: orderData.paymentDetails
    });

    return newOrder;
  },

  getRecentOrders: async (sellerId?: number): Promise<Order[]> => {
    await delay(400);
    const orders = getStoredOrders();
    if (sellerId) {
      return orders.filter(order => order.items?.some(item => item.userId === sellerId));
    }
    return orders;
  },

  // --- Dashboard Data (Mocked) ---
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(400);
    const products = getStoredProducts();
    const users = getStoredUsers();
    const orders = getStoredOrders();

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    return {
      totalRevenue: totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalUsers: users.length
    };
  },

  getSellerStats: async (sellerId: number): Promise<SellerStats> => {
    await delay(400);
    // Calculate somewhat real stats based on orders
    const orders = getStoredOrders().filter(order => order.items?.some(item => item.userId === sellerId));
    let revenue = 0;
    let units = 0;

    orders.forEach(order => {
      const sellerItems = order.items?.filter(item => item.userId === sellerId) || [];
      sellerItems.forEach(item => {
        // Assume quantity is 1 if not present for mock compat
        const qty = (item as any).quantity || 1;
        revenue += item.price * qty;
        units += qty;
      });
    });

    // Fallback if no orders yet for demo purposes
    if (revenue === 0) revenue = 12450;
    if (units === 0) units = 142;

    return {
      totalRevenue: revenue,
      revenueGrowth: 12,
      unitsSold: units,
      unitsGrowth: 8.5,
      conversionRate: 3.2,
      conversionGrowth: 0.4,
      monthlySales: [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95]
    };
  },

  getUsers: async (): Promise<User[]> => {
    await delay(400);
    return getStoredUsers();
  },

  // --- Payments ---
  processPayment: async (paymentData: { orderId: number, amount: number, paymentMethod: string, cardDetails?: any }): Promise<any> => {
    await delay(1000);

    // Simulate payment failure for specific amount (e.g., if amount ends in .99) - optional, keeping it simple for now

    const payments = getStoredPayments();
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const currentUser = storedUser ? JSON.parse(storedUser) : { id: 999 };

    const newPayment = {
      id: Date.now(),
      orderId: paymentData.orderId,
      userId: currentUser.id,
      amount: paymentData.amount,
      status: 'completed', // Mock success
      paymentMethod: paymentData.paymentMethod || 'Credit Card',
      transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    payments.push(newPayment);
    setStoredPayments(payments);

    return newPayment;
  },

  updateUserStatus: async (userId: number, isActive: boolean): Promise<void> => {
    await delay(400);
    const users = getStoredUsers();
    const updatedUsers = users.map(u => u.id === userId ? { ...u, isActive } : u);
    setStoredUsers(updatedUsers);
  }
};