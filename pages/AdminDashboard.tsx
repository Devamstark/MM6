
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Product, DashboardStats, User as UserType, Order } from '../types';
import { Plus, Edit2, Trash2, Loader2, DollarSign, ShoppingBag, Users, Package, Search, Ban, CheckCircle, XCircle, X, Filter, Move, GripVertical, Upload, Image as Images, Mail, MessageSquare, Check, Trash } from 'lucide-react';
import { ProductForm } from '../components/ProductForm';
import { SortableProductList } from '../components/SortableProductList';
import { BatchProductCreator } from '../components/BatchProductCreator';
import { AdminAnalytics } from '../components/AdminAnalytics';
import * as RadixTabs from '@radix-ui/react-tabs';

import { SalesOverview } from '../components/dashboard/SalesOverview';
import { StatusOverview } from '../components/dashboard/StatusOverview';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';

import { StaffTab } from '../components/dashboard/StaffTab';
import { CMSTab } from '../components/dashboard/CMSTab';


export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sellers' | 'users' | 'orders' | 'messages' | 'analytics' | 'staff' | 'cms'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<import('../types').ContactMessage[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [productPage, setProductPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

  const [orderPage, setOrderPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(false);
  const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);

  // Filters
  const [sellerFilter, setSellerFilter] = useState<string>('');

  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBatchCreatorOpen, setIsBatchCreatorOpen] = useState(false);



  const [isReordering, setIsReordering] = useState(false);
  const [savingReorder, setSavingReorder] = useState(false);
  const [productCatTab, setProductCatTab] = useState('all');

  // User Management
  const [viewingUser, setViewingUser] = useState<UserType | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editUserForm, setEditUserForm] = useState<{ first_name: string; last_name: string; email: string; role: string; is_active: boolean }>({ first_name: '', last_name: '', email: '', role: 'user', is_active: true });

  const formRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFormOpen && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isFormOpen]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Use allSettled so one failing API doesn't block everything else
      // Pass page_size=500 to get ALL products and orders in a single request
      const [statsResult, productsResult, usersResult, ordersResult, categoriesResult, messagesResult] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getProducts({ page_size: 500 } as any),
        api.getUsers(),
        api.getRecentOrders(),
        api.getCategories(),
        api.getContactMessages(),
      ]);

      if (statsResult.status === 'fulfilled') setStats(statsResult.value);

      if (productsResult.status === 'fulfilled') {
        const productsRes = productsResult.value as any;
        const allProducts = productsRes.results || [];
        setProducts(allProducts.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)));
        setHasMoreProducts(false);
        setProductPage(1);
      }

      if (usersResult.status === 'fulfilled') setUsers(usersResult.value);

      if (ordersResult.status === 'fulfilled') {
        const ordersRes = ordersResult.value as any;
        const ordersList = ordersRes.results || [];
        setOrders(ordersList);
        setHasMoreOrders(!!ordersRes.next);
        setOrderPage(1);
      }

      if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value);
      if (messagesResult.status === 'fulfilled') setMessages(messagesResult.value as any);

    } catch (e) {
      console.error('loadData error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMoreProducts = async () => {
    if (loadingMoreProducts || !hasMoreProducts) return;
    setLoadingMoreProducts(true);
    try {
      const nextPage = productPage + 1;
      const res = await api.getProducts({ page: nextPage });
      const newItems = (res as any).results || [];
      setProducts(prev => [...prev, ...newItems].sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)));
      setProductPage(nextPage);
      setHasMoreProducts(!!(res as any).next);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMoreProducts(false);
    }
  };

  const handleLoadMoreOrders = async () => {
    if (loadingMoreOrders || !hasMoreOrders) return;
    setLoadingMoreOrders(true);
    try {
      const nextPage = orderPage + 1;
      // Note: api.getRecentOrders doesn't currently take page, but we'll pass it for future-proofing or if we use the same endpoint
      const res = await api.getRecentOrders();
      const newItems = (res as any).results || [];
      setOrders(prev => [...prev, ...newItems]);
      setOrderPage(nextPage);
      setHasMoreOrders(!!(res as any).next);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMoreOrders(false);
    }
  };

  const handleProductDelete = async (id: string) => {
    if (window.confirm('Delete this product?')) {
      await api.deleteProduct(id);
      loadData();
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: status as any } : o));
      setSelectedOrder(prev => prev ? { ...prev, status: status as any } : null);
      alert(`Order status updated to ${status}`);
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleReorderSave = async () => {
    setSavingReorder(true);
    try {
      const itemsToUpdate = products.map((p, index) => ({
        id: p.id,
        display_order: index
      }));
      await api.reorderProducts(itemsToUpdate);
      setIsReordering(false);
      // No need to reload, local state is already updated by the drag component
    } catch (e) {
      console.error(e);
      alert('Failed to save order');
    } finally {
      setSavingReorder(false);
    }
  };

  const applyDiscount = async (percentage: number) => {
    if (!discountProduct) return;
    try {
      await api.updateProduct(discountProduct.id, { discountPercentage: percentage });
      setDiscountProduct(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to update discount');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = !(currentStatus ?? true);
      await api.updateUserStatus(userId, newStatus);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to update user status');
    }
  };

  const handleMarkRead = async (id: string) => {
    await api.markMessageAsRead(id);
    loadData();
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('Delete this message?')) {
      await api.deleteContactMessage(id);
      loadData();
    }
  };

  const openForm = (product?: Product) => {
    setEditingProduct(product || null);
    setIsFormOpen(true);
    setActiveTab('products');
  };

  // derived state
  const sellers = users.filter(u => u.role === 'seller');
  const getSellerProductCount = (sellerId: string) => products.filter(p => p.userId === sellerId).length;

  const filteredOrders = sellerFilter
    ? orders.filter(order => order.items?.some(item => item.userId === sellerFilter))
    : orders;

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.zip')) {
        alert('Please upload a .zip file');
        return;
      }

      setIsUploading(true);
      try {
        const result = await api.bulkUploadProducts(file);
        alert(result.message);
        if (result.errors && result.errors.length > 0) {
          console.warn('Upload errors:', result.errors);
          alert('Some products failed to upload. Check console for details.');
        }
        loadData();
      } catch (error) {
        console.error(error);
        alert('Failed to upload products');
      } finally {
        setIsUploading(false);
      }
    }
  };

  // -- User Management Handlers --
  const handleEditUser = (u: UserType) => {
    setEditingUser(u);
    setEditUserForm({
      first_name: (u as any).firstName || u.name.split(' ')[0] || '',
      last_name: (u as any).lastName || u.name.split(' ').slice(1).join(' ') || '',
      email: u.email,
      role: u.role,
      is_active: u.isActive !== false,
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      await api.updateUser(editingUser.id, editUserForm);
      setEditingUser(null);
      loadData();
    } catch (e: any) {
      alert('Failed to update user: ' + (e?.response?.data?.error || 'Unknown error'));
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) return;
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e: any) {
      alert('Failed to delete user: ' + (e?.response?.data?.error || 'Unknown error'));
    }
  };

  if (loading) return <div className="p-10 flex justify-center bg-gray-50 dark:bg-slate-950 transition-colors"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" /></div>;

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20 transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12 animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-indigo-600 font-semibold text-xs uppercase tracking-[0.3em] mb-3 block">Management Portal</span>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>Admin Dashboard</h1>
            <p className="text-gray-600 font-normal mt-2 text-base dark:text-gray-400">Real-time insights and product management console.</p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 shadow-inner">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest leading-none">Security Status</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">System Healthy</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-12 w-full animate-fade-up delay-100 overflow-x-auto pb-2">
          {['overview', 'products', 'sellers', 'users', 'orders', 'messages', 'analytics', 'staff', 'cms'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-xl text-[11px] font-semibold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === tab
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 -translate-y-0.5'
                : 'bg-white text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:text-indigo-400'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-up delay-200">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <SalesOverview stats={stats} orders={orders} />
              <StatusOverview
                orders={orders}
                productsCount={products.length}
                lowStockCount={products.filter(p => p.stock < 10).length}
              />
              <DashboardCharts orders={orders} products={products} />

              {/* Recent Orders Preview */}
              <div className="flex justify-between items-end mt-12 mb-6 px-2">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-2xl tracking-tight">Recent Orders</h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last 5 transactions processed.</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
                >
                  View All &rarr;
                </button>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                  <thead className="bg-white dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">Order ID</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">Items</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">Status</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 font-bold text-indigo-600">#{order.id}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-200">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-gray-200">${order.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (() => {
            const PRODUCT_CATS = [
              { key: 'all', label: 'All Products' },
              { key: 'Men', label: 'Men' },
              { key: 'Women', label: 'Women' },
              { key: 'Accessories', label: 'Accessories' },
            ];
            const filteredByCategory = productCatTab === 'all'
              ? products
              : products.filter(p => (p.category || '').toLowerCase() === productCatTab.toLowerCase());

            const getCount = (key: string) =>
              key === 'all' ? products.length : products.filter(p => (p.category || '').toLowerCase() === key.toLowerCase()).length;

            return (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                  {/* Header row */}
                  <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                      <h3 className="font-semibold text-base text-gray-800 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Products</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{products.length} total products in catalog</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setIsBatchCreatorOpen(true)}
                        className="bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all"
                      >
                        <Images className="w-4 h-4" /> Batch Creator
                      </button>
                      <input type="file" accept=".zip" className="hidden" ref={fileInputRef} onChange={handleBulkUpload} />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Import ZIP
                      </button>
                      <button
                        onClick={() => setIsReordering(!isReordering)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${isReordering ? 'bg-gray-900 text-white dark:bg-indigo-600' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        <Move className="w-4 h-4" /> {isReordering ? 'Done' : 'Reorder'}
                      </button>
                      <button
                        onClick={() => openForm()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
                      >
                        <Plus className="w-4 h-4" /> Add Product
                      </button>
                    </div>
                  </div>

                  {/* Radix Category Tabs */}
                  <RadixTabs.Root value={productCatTab} onValueChange={setProductCatTab}>
                    <RadixTabs.List className="flex gap-0 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 overflow-x-auto" aria-label="Product categories">
                      {PRODUCT_CATS.map(cat => (
                        <RadixTabs.Trigger
                          key={cat.key}
                          value={cat.key}
                          className={
                            `relative flex items-center gap-2 px-4 py-3.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all outline-none ` +
                            `data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 ` +
                            `data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-600 ` +
                            `hover:text-gray-800 dark:hover:text-gray-200 dark:data-[state=active]:text-indigo-400 dark:data-[state=active]:border-indigo-400`
                          }
                        >
                          {cat.label}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${productCatTab === cat.key
                            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                            {getCount(cat.key)}
                          </span>
                        </RadixTabs.Trigger>
                      ))}
                    </RadixTabs.List>

                    {PRODUCT_CATS.map(cat => (
                      <RadixTabs.Content key={cat.key} value={cat.key}>
                        {isReordering ? (
                          <SortableProductList
                            products={filteredByCategory}
                            onReorder={setProducts}
                            onSave={handleReorderSave}
                            saving={savingReorder}
                          />
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                              <thead className="bg-gray-50/60 dark:bg-gray-900/50">
                                <tr>
                                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Product Name</th>
                                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Sale Price</th>
                                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                                  <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                  <th className="px-5 py-4 text-center text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">View</th>
                                  <th className="px-5 py-4 text-center text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Published</th>
                                  <th className="px-5 py-4 text-right text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                                {filteredByCategory.length === 0 ? (
                                  <tr>
                                    <td colSpan={9} className="px-6 py-16 text-center">
                                      <Package className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                      <p className="text-sm text-gray-600 dark:text-gray-400">No products in this category yet.</p>
                                      <button onClick={() => openForm()} className="mt-4 text-xs text-indigo-600 font-semibold hover:underline">+ Add a product</button>
                                    </td>
                                  </tr>
                                ) : filteredByCategory.map(p => {
                                  const seller = users.find(u => u.id === p.userId);
                                  return (
                                    <tr key={p.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800 transition-all group">
                                      {/* Product Name + Image */}
                                      <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                          <div className="h-10 w-10 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 shrink-0">
                                            <img className="h-full w-full object-cover" src={p.imageUrl} alt="" />
                                          </div>
                                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{p.name}</span>
                                        </div>
                                      </td>
                                      {/* Category */}
                                      <td className="px-5 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{p.category || '—'}</span>
                                      </td>
                                      {/* Price */}
                                      <td className="px-5 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">${p.price.toFixed(2)}</span>
                                      </td>
                                      {/* Sale Price */}
                                      <td className="px-5 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                          {p.salePrice ? `$${p.salePrice.toFixed(2)}` : '—'}
                                        </span>
                                      </td>
                                      {/* Stock */}
                                      <td className="px-5 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{p.stock}</span>
                                      </td>
                                      {/* Status Badge */}
                                      <td className="px-5 py-4 whitespace-nowrap">
                                        {p.stock > 0 ? (
                                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Selling</span>
                                        ) : (
                                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">Out of stock</span>
                                        )}
                                      </td>
                                      {/* View */}
                                      <td className="px-5 py-4 whitespace-nowrap text-center">
                                        <button
                                          onClick={() => window.open(`/products/${p.slug || p.id}`, '_blank')}
                                          className="w-8 h-8 inline-flex items-center justify-center text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-full transition-all dark:bg-gray-800 dark:hover:bg-indigo-900/30"
                                          title="View Product"
                                        >
                                          <Search className="w-4 h-4" />
                                        </button>
                                      </td>
                                      {/* Published Toggle */}
                                      <td className="px-5 py-4 whitespace-nowrap text-center">
                                        <button
                                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${p.isFeatured ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                          onClick={async () => {
                                            try {
                                              await api.updateProduct(p.id, { isFeatured: !p.isFeatured });
                                              setProducts(prev => prev.map(item => item.id === p.id ? { ...item, isFeatured: !item.isFeatured } : item));
                                            } catch { alert('Failed to toggle'); }
                                          }}
                                          title={p.isFeatured ? 'Published — Click to unpublish' : 'Unpublished — Click to publish'}
                                        >
                                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${p.isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                      </td>
                                      {/* Actions */}
                                      <td className="px-5 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-1.5">
                                          <button onClick={() => openForm(p)} className="w-8 h-8 flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-all" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                                          <button onClick={() => handleProductDelete(p.id)} className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            {hasMoreProducts && productCatTab === 'all' && (
                              <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                                <button
                                  onClick={handleLoadMoreProducts}
                                  disabled={loadingMoreProducts}
                                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 disabled:opacity-50"
                                >
                                  {loadingMoreProducts ? 'Loading...' : 'Load More Products'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </RadixTabs.Content>
                    ))}
                  </RadixTabs.Root>
                </div>

                <div ref={formRef}>
                  {isFormOpen && (
                    <ProductForm
                      isInline={true}
                      initialData={editingProduct}
                      onClose={() => setIsFormOpen(false)}
                      onSubmit={() => {
                        setIsFormOpen(false);
                        loadData();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}
                </div>
              </>
            );
          })()}

          {/* Sellers Management Tab */}
          {activeTab === 'sellers' && (
            <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Seller Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enable or disable seller accounts and view their inventory size.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                  <thead className="bg-[#fcfcfd] dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Seller Identity</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Inventory</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Control</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                    {sellers.map(s => (
                      <tr key={s.id} className={`hover:bg-gray-50/80 dark:hover:bg-gray-800 transition-all group ${s.isActive === false ? 'bg-gray-50/50 dark:bg-gray-800/50 opacity-75' : ''}`}>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs mr-3 border border-indigo-100 dark:border-indigo-800 group-hover:scale-110 transition-transform">
                              {s.name.charAt(0)}
                            </div>
                            <div className="text-sm font-black text-gray-900 dark:text-white">{s.name}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-medium">{s.email}</td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-sm font-black text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            {getSellerProductCount(s.id)} SKU Details
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`px-3 py-1.5 inline-flex text-[10px] font-black uppercase tracking-widest rounded-full 
                                ${s.isActive !== false ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {s.isActive !== false ? 'Verified Active' : 'Account Disabled'}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className={`flex items-center gap-2 ml-auto px-5 py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest shadow-sm ${s.isActive !== false
                              ? 'text-red-600 border-red-100 bg-red-50 hover:bg-red-600 hover:text-white'
                              : 'text-green-600 border-green-100 bg-green-50 hover:bg-green-600 hover:text-white'
                              }`}
                            onClick={() => toggleUserStatus(s.id, s.isActive)}
                          >
                            {s.isActive !== false ? <><Ban className="w-3.5 h-3.5" /> Disable Access</> : <><CheckCircle className="w-3.5 h-3.5" /> Restore Access</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sellers.length === 0 && <div className="p-12 text-center text-gray-500 font-medium">No sellers found.</div>}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <thead className="bg-[#fcfcfd] dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                    {users.map((u, idx) => {
                      // Format ID: User-001, Seller-002, Blog-003 based on role
                      const prefix = u.role === 'seller' ? 'Seller' : u.role === 'blogger' ? 'Blog' : u.role === 'admin' ? 'Admin' : 'User';
                      const displayId = `${prefix}-${String(idx + 1).padStart(3, '0')}`;

                      return (
                        <tr key={u.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800 transition-all group">
                          {/* Formatted ID */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{displayId}</span>
                          </td>
                          {/* Name */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs mr-3 border border-slate-200 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                                {u.name.charAt(0)}
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</span>
                            </div>
                          </td>
                          {/* Email */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{u.email}</span>
                          </td>
                          {/* Role */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs font-bold uppercase tracking-wider rounded-full 
                                   ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' :
                                u.role === 'seller' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                  u.role === 'blogger' ? 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
                                    'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                              }`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs font-bold uppercase tracking-wider rounded-full 
                                   ${u.isActive !== false
                                ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}`}>
                              {u.isActive !== false ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          {/* Joined */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </td>
                          {/* Actions: View, Edit, Delete */}
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => setViewingUser(u)} className="w-8 h-8 flex items-center justify-center text-gray-500 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all dark:bg-gray-800 dark:hover:bg-indigo-900/30" title="View Details"><Search className="w-4 h-4" /></button>
                              <button onClick={() => handleEditUser(u)} className="w-8 h-8 flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-all" title="Edit User"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteUser(u.id, u.name)} className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all" title="Delete User"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* View User Detail Modal */}
              {viewingUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingUser(null)}>
                  <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative" onClick={e => e.stopPropagation()} style={{ fontFamily: 'Inter, sans-serif' }}>
                    <button onClick={() => setViewingUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl border-2 border-indigo-200 dark:border-indigo-800">{viewingUser.name.charAt(0)}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewingUser.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{viewingUser.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                      <div className="flex justify-between"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">User ID</span><span className="text-sm font-bold text-gray-900 dark:text-white font-mono">{viewingUser.id}</span></div>
                      <div className="flex justify-between"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Role</span><span className="text-sm font-bold text-gray-900 dark:text-white uppercase">{viewingUser.role}</span></div>
                      <div className="flex justify-between"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Status</span><span className={`text-sm font-bold ${viewingUser.isActive !== false ? 'text-green-600' : 'text-red-600'}`}>{viewingUser.isActive !== false ? 'Active' : 'Disabled'}</span></div>
                      <div className="flex justify-between"><span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Joined</span><span className="text-sm font-bold text-gray-900 dark:text-white">{viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                    </div>
                    <button onClick={() => setViewingUser(null)} className="w-full mt-6 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Close</button>
                  </div>
                </div>
              )}

              {/* Edit User Modal */}
              {editingUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
                  <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative" onClick={e => e.stopPropagation()} style={{ fontFamily: 'Inter, sans-serif' }}>
                    <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Edit User — {editingUser.name}</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 block">First Name</label>
                          <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" value={editUserForm.first_name} onChange={e => setEditUserForm({ ...editUserForm, first_name: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 block">Last Name</label>
                          <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" value={editUserForm.last_name} onChange={e => setEditUserForm({ ...editUserForm, last_name: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 block">Email</label>
                        <input type="email" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" value={editUserForm.email} onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 block">Role</label>
                        <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer" value={editUserForm.role} onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })}>
                          <option value="user">User</option>
                          <option value="seller">Seller</option>
                          <option value="blogger">Blogger</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Account Active</label>
                        <button type="button" className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${editUserForm.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => setEditUserForm({ ...editUserForm, is_active: !editUserForm.is_active })}>
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editUserForm.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setEditingUser(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                      <button onClick={handleSaveUser} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">Save Changes</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-bold dark:text-gray-300">Filter by Seller:</span>
                </div>
                <select
                  className="border-none bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg text-sm p-2 px-4 shadow-sm focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
                  value={sellerFilter}
                  onChange={(e) => setSellerFilter(e.target.value)}
                >
                  <option value="">All Sellers</option>
                  {sellers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                  <thead className="bg-[#fcfcfd] dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">Order ID</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">Customer</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">Items</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">Total</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">Status</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800 transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400">#{order.id}</td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{order.customerName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{order.email}</div>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-500 dark:text-gray-400">
                          <div className="text-sm text-gray-900 dark:text-gray-200 font-medium">{order.items?.length || 0} Items</div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-200">${order.totalPrice.toFixed(2)}</div>
                          <div className="text-xs font-medium text-green-600 dark:text-green-400">Paid</div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full capitalize
                                 ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm font-medium hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {hasMoreOrders && (
                  <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                    <button
                      onClick={handleLoadMoreOrders}
                      disabled={loadingMoreOrders}
                      className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50"
                    >
                      {loadingMoreOrders ? 'Syncing...' : 'Load More Orders'}
                    </button>
                  </div>
                )}
              </div>
              {filteredOrders.length === 0 && <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">No orders found.</div>}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Contact Messages</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage inquiries from users via the contact form.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                  <thead className="bg-[#fcfcfd] dark:bg-gray-950">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">From</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {messages.map(msg => (
                      <React.Fragment key={msg.id}>
                        <tr className={`hover:bg-gray-50/80 transition-all ${!msg.isRead ? 'bg-indigo-50/20' : ''}`}>
                          <td className="px-8 py-6 whitespace-nowrap text-[10px] font-black text-gray-600 uppercase tracking-widest">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className={`text-sm ${!msg.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-500'}`}>{msg.name}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{msg.email}</div>
                          </td>
                          <td className={`px-8 py-6 whitespace-nowrap text-sm ${!msg.isRead ? 'font-black text-indigo-600' : 'font-medium text-gray-600'}`}>
                            {msg.subject || '(No Subject Provided)'}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${msg.isRead ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-indigo-600 text-white border border-indigo-700'}`}>
                              {msg.isRead ? 'Archived' : 'High Priority'}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {!msg.isRead && (
                                <button
                                  onClick={() => handleMarkRead(msg.id)}
                                  className="w-9 h-9 flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                                  title="Mark as Read"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="w-9 h-9 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                                title="Delete Permanent"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr className={!msg.isRead ? 'bg-indigo-50/10' : ''}>
                          <td colSpan={5} className="px-8 py-6 border-b border-gray-50">
                            <div className="bg-[#fcfcfd] dark:bg-gray-950 p-6 rounded-3xl text-sm text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 transition-colors shadow-sm italic leading-relaxed">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Disclosure</span>
                              </div>
                              "{msg.message}"
                              <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 transition-colors">
                                <a href={`mailto:${msg.email}`} className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">Generate Direct Response &rarr;</a>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              {messages.length === 0 && <div className="p-12 text-center text-gray-500 font-medium">No messages found.</div>}
            </div>
          )}

          {activeTab === 'analytics' && (
            <AdminAnalytics orders={orders} products={products} />
          )}


          {activeTab === 'staff' && (
            <StaffTab />
          )}

          {activeTab === 'cms' && (
            <CMSTab />
          )}
        </div>

      </div>

      {isBatchCreatorOpen && (
        <BatchProductCreator
          onClose={() => setIsBatchCreatorOpen(false)}
          onSuccess={() => {
            loadData();
          }}
          existingCategories={categories}
        />
      )}

      {/* Discount Modal */}
      {discountProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-4xl p-8 max-w-sm w-full animate-fade-in border border-gray-100 dark:border-gray-800 shadow-2xl transition-all">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Set Sale Discount</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select a discount percentage for "{discountProduct.name}".</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[10, 20, 30, 40, 50, 60].map(p => (
                <button
                  key={p}
                  onClick={() => applyDiscount(p)}
                  className={`py-3 rounded-xl font-black text-xs uppercase tracking-widest border transition-all ${discountProduct.discountPercentage === p
                    ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200 dark:shadow-red-900/20'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:border-red-600 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                >
                  {p}%
                </button>
              ))}
            </div>

            <button
              onClick={() => applyDiscount(0)}
              className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all mb-3 border border-gray-100 dark:border-gray-700"
            >
              Remove Sale
            </button>
            <button
              onClick={() => setDiscountProduct(null)}
              className="w-full py-3 text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in transition-all">
          <div className="bg-white dark:bg-gray-900 rounded-4xl w-full max-w-2xl p-8 shadow-2xl relative animate-scale-in border border-gray-100 dark:border-gray-800 transition-all">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Order Details</h2>
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID: #{selectedOrder.id}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Customer Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors">
                  <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{selectedOrder.email}</p>
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Shipping Address</h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors">
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{selectedOrder.shippingAddress || 'No address provided'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Payment Info</h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors">
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{selectedOrder.paymentMethod || 'Credit Card'}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-1">Paid in Full</p>
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Current Status</h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors">
                  <span className={`px-4 py-1.5 inline-flex text-[10px] font-black rounded-full uppercase tracking-widest transition-colors
                                ${selectedOrder.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                      selectedOrder.status === 'shipped' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' :
                        selectedOrder.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
                          'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                    }`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Order Items</h3>
              <div className="space-y-4">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-lg shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${selectedOrder.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 transition-colors">
              <button
                onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                disabled={selectedOrder.status === 'processing' || selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                className="grow bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 py-3 rounded-xl font-bold hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Accept Order
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                disabled={selectedOrder.status === 'shipped' || selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                className="grow bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 py-3 rounded-xl font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Dispatch / Ship
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                className="grow bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 py-3 rounded-xl font-bold hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Confirm Delivery
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this order?')) {
                    handleStatusUpdate(selectedOrder.id, 'cancelled');
                  }
                }}
                disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                className="grow bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 py-3 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg, delay }: any) => (
  <div className="bg-white dark:bg-gray-900 overflow-hidden rounded-4xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-800 p-8 flex items-center group animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div className={`w-16 h-16 rounded-3xl ${bg} ${color} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm`}>
      <Icon className="h-7 w-7" />
    </div>
    <div className="ml-6">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
    </div>
  </div>
);