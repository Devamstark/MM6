import React, { useState, useEffect, useRef } from 'react';
import { Bell, Package, Tag, RefreshCw, Info, Check, Trash2, X, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Notification, Product } from '../types';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export const NotificationCenter = () => {
    const { user, isAdmin } = useAuth();
    const { items: cartItems } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    // Initialize from LocalStorage
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem('cm_notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Persist to LocalStorage whenever notifications change
    useEffect(() => {
        localStorage.setItem('cm_notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Initialize dismissed IDs from LocalStorage to prevent reappearance
    const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('cm_dismissed_ids');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist dismissed IDs
    useEffect(() => {
        localStorage.setItem('cm_dismissed_ids', JSON.stringify(dismissedIds));
    }, [dismissedIds]);

    // Track when cart was last updated to trigger abandonment notification
    useEffect(() => {
        if (cartItems.length > 0) {
            localStorage.setItem('cm_cart_last_active', Date.now().toString());
        }
    }, [cartItems]);

    // Generate REAL-TIME Notifications
    useEffect(() => {
        const checkNotifications = async () => {
            const newNotifications: Notification[] = [];

            // 1. Cart Abandonment (Real-time check)
            const lastActive = parseInt(localStorage.getItem('cm_cart_last_active') || '0');
            const now = Date.now();
            const minutesSinceUpdate = (now - lastActive) / 1000 / 60;

            // Trigger if cart has items and it's been > 5 minutes
            if (cartItems.length > 0 && minutesSinceUpdate >= 5) {
                // Check if we already showed this notification recently to avoid spam
                const lastNotified = parseInt(localStorage.getItem('cm_cart_notified_at') || '0');
                if (now - lastNotified > 30 * 60 * 1000) { // Don't notify more than once every 30 mins
                    const notif: Notification = {
                        id: 'cart-abandon', // Stable ID to prevent duplicates if already present
                        type: 'announcement',
                        title: 'Items waiting for you!',
                        message: `You have ${cartItems.length} items in your cart. Complete your purchase now!`,
                        date: 'Just now',
                        read: false,
                        link: '/checkout'
                    };
                    newNotifications.push(notif);
                }
            }

            // 2. Back in Stock (Real-time check based on visited OOS history)
            const visitedOoSIds = JSON.parse(localStorage.getItem('cm_visited_oos') || '[]');
            if (visitedOoSIds.length > 0) {
                try {
                    const allProducts = await api.getProducts(); // Fetch latest stock
                    const backInStock = allProducts.filter(p => visitedOoSIds.includes(p.id) && p.stock > 0);

                    backInStock.forEach(p => {
                        newNotifications.push({
                            id: `restock-${p.id}`,
                            type: 'restock',
                            title: 'Back in Stock!',
                            message: `Good news! ${p.name} is now available.`,
                            date: 'Just now',
                            read: false,
                            link: `/product/${p.id}`
                        });
                        // Remove from tracking so we don't notify again
                        const newVisited = visitedOoSIds.filter((id: string) => id !== p.id);
                        localStorage.setItem('cm_visited_oos', JSON.stringify(newVisited));
                    });
                } catch (e) {
                    console.error("Failed to check stock", e);
                }
            }

            // 3. Admin: Low Stock Alerts (Real-time)
            if (isAdmin) {
                try {
                    const allProducts = await api.getProducts();
                    const lowStock = allProducts.filter(p => p.stock < 5 && p.stock > 0);
                    lowStock.forEach(p => {
                        newNotifications.push({
                            id: `low-stock-${p.id}`,
                            type: 'restock', // Reusing restock type for stock alerts
                            title: 'Low Stock Alert',
                            message: `${p.name} has only ${p.stock} units left.`,
                            date: 'Action needed',
                            read: false,
                            link: '/admin'
                        });
                    });
                    // Admin: New Orders (Simulated by checking recent orders vs last checked time)
                    // For MVP without backend sockets, we can just show the latest pending order if it's "new"
                    const orders = await api.getRecentOrders();
                    const pendingOrders = orders.filter(o => o.status === 'pending');
                    if (pendingOrders.length > 0) {
                        const latest = pendingOrders[0];
                        // Simple dedup by ID
                        const notifiedOrders = JSON.parse(localStorage.getItem('cm_notified_orders') || '[]');
                        if (!notifiedOrders.includes(latest.id)) {
                            newNotifications.push({
                                id: `order-${latest.id}`,
                                type: 'order_update',
                                title: 'New Order Received',
                                message: `Order #${latest.id} from ${latest.customerName} ($${latest.totalPrice})`,
                                date: 'New',
                                read: false,
                                link: '/admin'
                            });
                            localStorage.setItem('cm_notified_orders', JSON.stringify([...notifiedOrders, latest.id]));
                        }
                    }

                } catch (e) {
                    console.error("Admin check failed", e);
                }
            }

            if (newNotifications.length > 0) {
                setNotifications(prev => {
                    // Update 'lastNotified' for cart abandon ONLY if we are actually adding it
                    if (newNotifications.some(n => n.id === 'cart-abandon')) {
                        // Only update timestamp if we are adding it (it's not already there)
                        // OR if we are re-adding it (it was there but user dismissed it?)
                        // Actually, logic is: if we decided to push 'cart-abandon' (based on time check),
                        // update the timestamp now.
                        localStorage.setItem('cm_cart_notified_at', Date.now().toString());
                    }

                    // Filter out already existing IDs AND dismissed IDs
                    const existingIds = new Set(prev.map(n => n.id));
                    const dismissedIdSet = new Set(dismissedIds);

                    const uniqueNew = newNotifications.filter(n =>
                        !existingIds.has(n.id) && !dismissedIdSet.has(n.id)
                    );

                    if (uniqueNew.length === 0) return prev;
                    return [...uniqueNew, ...prev];
                });
            }
        };

        // Initial check
        checkNotifications();

        // Poll every minute for "Real Time" feel
        const interval = setInterval(checkNotifications, 60 * 1000);
        return () => clearInterval(interval);

    }, [cartItems, isAdmin, user, dismissedIds]);


    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
        setDismissedIds(prev => [...prev, id]);
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'order_update': return <Package className="w-5 h-5 text-indigo-600" />;
            case 'price_drop': return <Tag className="w-5 h-5 text-green-600" />;
            case 'restock': return <RefreshCw className="w-5 h-5 text-blue-600" />;
            case 'announcement': return <Info className="w-5 h-5 text-purple-600" />;
            default: return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getBgColor = (type: Notification['type']) => {
        switch (type) {
            case 'order_update': return 'bg-indigo-50';
            case 'price_drop': return 'bg-green-50';
            case 'restock': return 'bg-blue-50';
            case 'announcement': return 'bg-purple-50';
            default: return 'bg-gray-50';
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-300"
            >
                <Bell className={`w-5 h-5 ${isOpen ? 'fill-current' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-bounce shadow-sm border border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-up origin-top-right">
                    <div className="p-5 border-b border-gray-100 bg-white/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
                        <div>
                            <h3 className="font-black text-gray-900 text-lg tracking-tight">Updates</h3>
                            {user && (
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {unreadCount} Unread
                                </p>
                            )}
                        </div>
                        {user && unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    {!user ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                <Bell className="w-8 h-8 text-gray-300" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Login Required</h4>
                                <p className="text-sm text-gray-500 mb-4">Please login to view your notifications.</p>
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-block px-6 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors"
                                >
                                    Login Now
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                            {notifications.length > 0 ? (
                                notifications.map((n, i) => (
                                    <div
                                        key={n.id}
                                        onClick={() => markAsRead(n.id)}
                                        className={`relative group p-4 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent
                                            ${n.read ? 'hover:bg-gray-50 bg-white' : 'bg-blue-50/30 hover:bg-blue-50 border-blue-100 shadow-sm'}
                                        `}
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        {n.link ? (
                                            <Link to={n.link} className="absolute inset-0 z-0" onClick={() => setIsOpen(false)} />
                                        ) : (
                                            <div className="absolute inset-0 z-0" />
                                        )}

                                        <div className="relative z-10 flex gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${getBgColor(n.type)} shadow-sm border border-white`}>
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`text-sm font-bold truncate pr-6 ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                        {n.title}
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
                                                        {n.date}
                                                    </span>
                                                </div>
                                                <p className={`text-xs mt-1 line-clamp-2 ${n.read ? 'text-gray-500' : 'text-gray-600 font-medium'}`}>
                                                    {n.message}
                                                </p>
                                            </div>

                                            <button
                                                onClick={(e) => deleteNotification(e, n.id)}
                                                className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-md border border-gray-100 z-20 hover:scale-110"
                                                title="Dismiss"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                        {!n.read && (
                                            <div className="absolute top-1/2 -left-1 w-2 h-2 bg-indigo-500 rounded-full transform -translate-y-1/2 ring-4 ring-white shadow-sm" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm font-medium">No new notifications</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
