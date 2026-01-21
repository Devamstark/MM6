import { User, Product, AuthResponse, ProductFilter, DashboardStats, Order, SellerStats } from '../types';

// ============================================================================
// MOCK DATA & STORAGE (For Preview Environment Only)
// ============================================================================

const MOCK_DELAY = 400;
const STORAGE_KEYS = {
  USERS: 'cm_users',
  PRODUCTS: 'cm_products',
  TOKEN: 'cm_token',
  USER: 'cm_user_data',
  ORDERS: 'cm_orders'
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
    items: [] // Populated dynamically in real app, simplified here
  },
  {
    id: 102, userId: 4, customerName: 'Jane Smith', totalPrice: 89.99, status: 'shipped', createdAt: '2023-10-02',
    items: []
  },
  {
    id: 103, userId: 3, customerName: 'John Doe', totalPrice: 1250.00, status: 'pending', createdAt: '2023-10-03',
    items: []
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get local storage data
const getStoredProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(stored);
};

const getStoredOrders = (): Order[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!stored) {
    // Populate initial orders with items for demo
    // We do this here to avoid circular dep with INITIAL_PRODUCTS if we tried to use it above
    const products = INITIAL_PRODUCTS;
    const initialWithItems = INITIAL_ORDERS.map(o => {
      if (o.id === 101) return { ...o, items: [products[0]] };
      if (o.id === 102) return { ...o, items: [products[2]] };
      if (o.id === 103) return { ...o, items: [products[1]] };
      return o;
    });
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialWithItems));
    return initialWithItems;
  }
  return JSON.parse(stored);
};

const setStoredOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
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

// ============================================================================
// API SERVICE
// ============================================================================

export const api = {
  // --- Auth ---
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(MOCK_DELAY);
    const users = getStoredUsers();

    // Mock authentication logic
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
    await delay(MOCK_DELAY);
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
    await delay(MOCK_DELAY);
    return getStoredProducts().find(p => p.id === id);
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    await delay(MOCK_DELAY);
    const products = getStoredProducts();
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const currentUser = storedUser ? JSON.parse(storedUser) : { id: 1 }; // Default to ID 1 if null (admin)

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
    await delay(MOCK_DELAY);
    const products = getStoredProducts();
    const categories = Array.from(new Set(products.map(p => p.category)));
    return categories.sort();
  },

  getBrands: async (): Promise<string[]> => {
    await delay(MOCK_DELAY);
    const products = getStoredProducts();
    const brands = Array.from(new Set(products.map(p => p.brand)));
    return brands.sort();
  },

  // --- Dashboard Data (Mocked) ---
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(MOCK_DELAY);
    const products = getStoredProducts();
    const users = getStoredUsers();
    return {
      totalRevenue: 15430.50,
      totalOrders: 42,
      totalProducts: products.length,
      totalUsers: users.length
    };
  },

  getSellerStats: async (sellerId: number): Promise<SellerStats> => {
    await delay(MOCK_DELAY);
    // In a real app, we would aggregate orders for this seller.
    // For the mock, we return realistic looking static data + some randomization to feel alive
    return {
      totalRevenue: 12450.00,
      revenueGrowth: 12,
      unitsSold: 142,
      unitsGrowth: 8.5,
      conversionRate: 3.2,
      conversionGrowth: 0.4,
      monthlySales: [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95] // Normalized for chart
    };
  },

  getUsers: async (): Promise<User[]> => {
    await delay(MOCK_DELAY);
    return getStoredUsers();
  },

  updateUserStatus: async (userId: number, isActive: boolean): Promise<void> => {
    await delay(MOCK_DELAY);
    const users = getStoredUsers();
    const updatedUsers = users.map(u => u.id === userId ? { ...u, isActive } : u);
    setStoredUsers(updatedUsers);
  },

  getRecentOrders: async (): Promise<Order[]> => {
    await delay(MOCK_DELAY);
    const orders = getStoredOrders();
    // Return most recent first
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createOrder: async (orderData: any): Promise<Order> => {
    await delay(MOCK_DELAY);
    const orders = getStoredOrders();

    // Create new order
    const newOrder: Order = {
      id: Math.floor(Math.random() * 10000) + 1000,
      userId: orderData.userId,
      customerName: orderData.shippingAddress.fullName,
      totalPrice: orderData.totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      items: orderData.items
    };

    // Save to storage
    orders.push(newOrder);
    setStoredOrders(orders);

    return newOrder;
  },

  getMyOrders: async (userId: number): Promise<Order[]> => {
    await delay(MOCK_DELAY);
    const orders = getStoredOrders();
    return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getSellerOrders: async (sellerId: number): Promise<Order[]> => {
    await delay(MOCK_DELAY);
    const orders = getStoredOrders();

    return orders.filter(order => {
      // Check if any item in the order belongs to this seller
      return order.items?.some(item => item.userId === sellerId);
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};