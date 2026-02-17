export interface Address {
    id: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
    type: 'shipping' | 'billing';
}

export interface User {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNumber?: string;
    profilePicture?: string;
    role: 'user' | 'seller' | 'admin';
    bio?: string;
    bonusPoints?: number;
    isActive?: boolean;
    createdAt?: string;
    lastLogin?: string;
    token?: string;
    addresses?: Address[];
    isAffiliate?: boolean;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    brand: string;
    imageUrl: string;
    additionalImages?: string[];
    stock: number;
    gender?: string;
    sizes?: string[];
    colors?: string[];
    isFeatured?: boolean;
    isPopular?: boolean;
    variants?: any[];
    userId: string; // Seller ID
    createdAt: string;
    discountPercentage?: number;
    salePrice?: number;
    display_order?: number;

    // Cost fields
    cogs?: number;
    marketingCost?: number;
    shippingCost?: number;

    // Flash Sale
    flashSaleStart?: string;
    flashSaleEnd?: string;
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
    productName?: string;
    productImage?: string;
}

export interface ProductFilter {
    category?: string;
    subcategory?: string;
    brand?: string;
    sellerId?: string;
    search?: string;
    onSale?: boolean;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean; // Using 'isFeatured' for consistency
    isPopular?: boolean;
    sort?: string;
}

export interface Order {
    id: string;
    userId: string;
    customerName: string;
    email?: string; // Contact email
    shippingAddress?: string; // Formatted address
    paymentMethod?: string;
    totalPrice: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    items?: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        imageUrl?: string;
        userId?: string; // Seller ID for the item
    }>;
}

export interface DashboardStats {
    totalRevenue: number;
    totalUnitsSold?: number; // derived in frontend usually, but added here just in case
    totalUsers?: number;
    monthlyTrend?: number[];
    recentOrders?: Order[];
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

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface Affiliate {
    id: string;
    userName: string;
    referralCode: string;
    earnings: number;
    clicks: number;
    createdAt: string;
}

export interface SearchSuggestions {
    categories: string[];
    products: Product[];
}

export interface Notification {
    id: string;
    type: 'order_update' | 'price_drop' | 'restock' | 'announcement';
    title: string;
    message: string;
    date: string;
    read: boolean;
    link?: string;
}
