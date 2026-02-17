import React, { useState, useEffect, useRef } from 'react';
import { Bell, Package, Tag, RefreshCw, Info, Check, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../types';
import { Link } from 'react-router-dom';

export const NotificationCenter = () => {
    const { user, isAdmin } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Mock Notification Generator
    useEffect(() => {
        const generateNotifications = () => {
            const newNotifications: Notification[] = [];

            if (isAdmin) {
                newNotifications.push({
                    id: '1',
                    type: 'order_update',
                    title: 'New Order Received',
                    message: 'Order #3029 by John Doe ($129.00)',
                    date: '2 mins ago',
                    read: false,
                    link: '/admin',
                });
                newNotifications.push({
                    id: '2',
                    type: 'restock',
                    title: 'Low Stock Alert',
                    message: 'Premium Cotton T-Shirt (L) is below 5 units.',
                    date: '1 hour ago',
                    read: false,
                    link: '/admin',
                });
                newNotifications.push({
                    id: '3',
                    type: 'announcement',
                    title: 'System Update',
                    message: 'Maintenance scheduled for tonight at 2 AM.',
                    date: '5 hours ago',
                    read: true,
                });
            } else {
                newNotifications.push({
                    id: '4',
                    type: 'order_update',
                    title: 'Order Shipped!',
                    message: 'Your order #2045 is on its way.',
                    date: 'Just now',
                    read: false,
                    link: '/orders',
                });
                newNotifications.push({
                    id: '5',
                    type: 'price_drop',
                    title: 'Price Drop Alert',
                    message: 'An item in your wishlist is now on sale!',
                    date: '30 mins ago',
                    read: false,
                    link: '/wishlist',
                });
                newNotifications.push({
                    id: '6',
                    type: 'restock',
                    title: 'Back in Stock',
                    message: 'The "Vintage Denim Jacket" is back!',
                    date: '2 hours ago',
                    read: true,
                    link: '/products',
                });
                newNotifications.push({
                    id: '7',
                    type: 'announcement',
                    title: 'Flash Sale',
                    message: 'Winter Sale starts in 24 hours. Get ready!',
                    date: '1 day ago',
                    read: true,
                    link: '/products?sort=price_asc',
                });
            }
            setNotifications(newNotifications);
        };

        generateNotifications();
    }, [isAdmin, user]);

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
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {unreadCount} Unread
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

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
                    {notifications.length > 0 && (
                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                            <button className="text-xs font-bold text-gray-500 hover:text-indigo-600 transition-colors">
                                View History
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
