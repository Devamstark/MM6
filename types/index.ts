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

export interface MarketingCampaign {
    id: string;
    name: string;
    subject: string;
    preheader?: string;
    message: string;
    plain_text?: string;
    banner_image_url?: string;
    cta_text?: string;
    cta_url?: string;
    discount_code?: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    discount_min_purchase?: number;
    discount_usage_limit?: number;
    discount_expiry_days?: number;
    coupon?: string;
    coupon_code?: string;
    coupon_active?: boolean;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';
    campaign_type: 'promotional' | 'abandoned_cart' | 're_engagement' | 'thank_you' | 'upsell';
    audience_type: 'all_users' | 'ordered_once' | 'never_ordered' | 'recent_signups' | 'abandoned_cart' | 'manual';
    audience_days?: number;
    manual_user_ids?: string[];
    scheduled_date?: string;
    sent_at?: string;
    total_recipients: number;
    emails_sent: number;
    emails_failed: number;
    emails_opened: number;
    emails_clicked: number;
    batch_size: number;
    delivery_rate: number;
    open_rate: number;
    click_rate: number;
    created_by?: number;
    created_by_name?: string;
    created_at: string;
    updated_at?: string;
}

export interface EmailDeliveryLog {
    id: string;
    campaign: string;
    campaign_name: string;
    user: number;
    user_name: string;
    email: string;
    user_email: string;
    status: 'pending' | 'sent' | 'failed' | 'opened' | 'clicked';
    sent_at?: string;
    opened_at?: string;
    clicked_at?: string;
    error_message?: string;
    retry_count: number;
}

export interface MarketingAnalytics {
    total_campaigns: number;
    total_sent_campaigns: number;
    total_emails_sent: number;
    total_emails_failed: number;
    total_opens: number;
    total_clicks: number;
    total_recipients: number;
    avg_delivery_rate: number;
    avg_open_rate: number;
    avg_click_rate: number;
    active_users: number;
    last_campaign: {
        id: string;
        name: string;
        status: string;
        sent_at?: string;
        emails_sent: number;
    } | null;
    status_breakdown: Record<string, number>;
    type_breakdown: Record<string, number>;
}

export interface AudiencePreview {
    count: number;
    sample: Array<{ id: string; username: string; email: string; date_joined: string }>;
}

export interface User {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNumber?: string;
    profilePicture?: string;
    role: 'user' | 'seller' | 'admin' | 'blogger';
    bio?: string;
    bonusPoints?: number;
    referralEarnings?: number;   // Accumulated referral bonus in dollars
    canRedeemEarnings?: boolean; // True when referralEarnings >= $10
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

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    author: string;          // author display name
    authorId: string;
    category: string;        // e.g. 'style', 'trends', 'care', 'news'
    tags: string[];
    isPublished: boolean;
    isFeatured: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    readingTime?: number;    // minutes
    views?: number;
    imageFit?: 'cover' | 'contain' | 'fill';  // how to display the image
}

export interface Product {
    id: string;
    name: string;
    slug: string;
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
    imageFit?: 'cover' | 'contain';
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
    page?: number;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface Order {
    id: string;
    trackingNumber?: string;
    subtotal?: number;
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
    earningsApplied?: number;
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
    // Phase 2A: Granular Analytics
    salesByRegion: { region: string; sales: number }[];
    cartAbandonmentRate: number;
    topSearchTerms: string[];
    inventoryHealth: { status: string; count: number }[];
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
