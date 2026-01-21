export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'user';
  token?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Product {
  id: number;
  userId?: number; // The seller ID
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  imageUrl: string;
  stock: number;
  isFeatured: boolean;
  isPopular: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  isFeatured?: boolean;
  isPopular?: boolean;
  sellerId?: number; // Filter by seller
}

export interface Order {
  id: number;
  userId: number;
  customerName?: string;
  totalPrice: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items?: Product[]; // For the UI to display details
  shippingAddress?: string;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers?: number;
}

export interface SellerStats {
  totalRevenue: number;
  revenueGrowth: number;
  unitsSold: number;
  unitsGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  monthlySales: number[];
}

export interface AuthResponse {
  user: User;
  token: string;
}