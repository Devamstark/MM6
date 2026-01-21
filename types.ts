export interface User {
  id: string; // Changed from number to string (UUID)
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'user';
  token?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Product {
  id: string; // Changed from number to string
  userId?: string; // Changed from number to string
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
  sellerId?: string; // Changed from number to string
}

export interface Order {
  id: string; // Changed from number to string
  userId: string; // Changed from number to string
  customerName?: string;
  totalPrice: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items?: Product[]; // For the UI to display details
  shippingAddress?: string;
}

export interface OrderItem {
  productId: string;
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

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
}