
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Product, DashboardStats, User as UserType, Order } from '../types';
import { Plus, Edit2, Trash2, Loader2, DollarSign, ShoppingBag, Users, Package, Search, Ban, CheckCircle, XCircle, X, Filter, Move, GripVertical, Upload, Image as Images, Mail, MessageSquare, Check, Trash } from 'lucide-react';
import { ProductForm } from '../components/ProductForm';
import { SortableProductList } from '../components/SortableProductList';
import { BatchProductCreator } from '../components/BatchProductCreator';
import { AdminAnalytics } from '../components/AdminAnalytics';


import { SalesOverview } from '../components/dashboard/SalesOverview';
import { StatusOverview } from '../components/dashboard/StatusOverview';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { CouponsTab } from '../components/dashboard/CouponsTab';
import { StaffTab } from '../components/dashboard/StaffTab';
import { CMSTab } from '../components/dashboard/CMSTab';


export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sellers' | 'users' | 'orders' | 'messages' | 'analytics' | 'coupons' | 'staff' | 'cms'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<import('../types').ContactMessage[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [sellerFilter, setSellerFilter] = useState<string>('');

  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBatchCreatorOpen, setIsBatchCreatorOpen] = useState(false);



  const [isReordering, setIsReordering] = useState(false);
  const [savingReorder, setSavingReorder] = useState(false);

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
      const [statsData, productsData, usersData, ordersData, categoriesData, messagesData] = await Promise.all([
        api.getDashboardStats(),
        api.getProducts(),
        api.getUsers(),
        api.getRecentOrders(),
        api.getCategories(),
        api.getContactMessages(),
      ]);
      setStats(statsData);
      // Sort products by display_order
      setProducts(productsData.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)));
      setUsers(usersData);
      setOrders(ordersData);
      setCategories(categoriesData);
      setMessages(messagesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  if (loading) return <div className="p-10 flex justify-center bg-gray-50 dark:bg-slate-950 transition-colors"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" /></div>;

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12 animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-3 block">Management Portal</span>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-400 font-medium mt-3 text-lg dark:text-gray-500">Real-time insights and product management console.</p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 font-black shadow-inner">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Security Status</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-200">System Healthy</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-12 w-full animate-fade-up delay-100 overflow-x-auto pb-2 scrollbar-hide">
          {['overview', 'products', 'sellers', 'users', 'orders', 'coupons', 'messages', 'analytics', 'staff', 'cms'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${activeTab === tab
                ? 'bg-indigo-600 text-white shadow-[0_20px_40px_-15px_rgba(79,70,229,0.4)] transform -translate-y-1'
                : 'bg-white text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-500 dark:hover:text-indigo-400'
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
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Total</th>
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

          {activeTab === 'products' && (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">All Products</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsBatchCreatorOpen(true)}
                      className="bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all"
                    >
                      <Images className="w-4 h-4" /> Batch Creator
                    </button>

                    <input
                      type="file"
                      accept=".zip"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleBulkUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Import ZIP
                    </button>
                    <button onClick={() => setIsReordering(!isReordering)} className={`px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${isReordering ? 'bg-gray-900 text-white dark:bg-indigo-600' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'} `}>
                      <Move className="w-4 h-4" /> {isReordering ? 'Done' : 'Reorder'}
                    </button>
                    <button onClick={() => openForm()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
                      <Plus className="w-4 h-4" /> Add Product
                    </button>
                  </div>
                </div>

                {isReordering ? (
                  <SortableProductList
                    products={products}
                    onReorder={setProducts}
                    onSave={handleReorderSave}
                    saving={savingReorder}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                      <thead className="bg-[#fcfcfd] dark:bg-gray-900/50">
                        <tr>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Details</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Vendor</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Valuation</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Campaign</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stock</th>
                          <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Command</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                        {products.map(p => {
                          const seller = users.find(u => u.id === p.userId);
                          return (
                            <tr key={p.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800 transition-all group">
                              <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 shrink-0 group-hover:scale-110 transition-transform duration-500">
                                    <img className="h-full w-full object-cover" src={p.imageUrl} alt="" />
                                  </div>
                                  <div className="ml-5">
                                    <div className="text-sm font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{p.name}</div>
                                    <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">{p.brand}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
                                  {seller ? seller.name : 'ID: ' + p.userId}
                                </span>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <div className="text-sm font-black text-gray-900 dark:text-white">${p.price}</div>
                                {p.salePrice && <div className="text-[10px] text-red-500 font-bold line-through ml-0.5">${p.price}</div>}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                {p.discountPercentage ? (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800">
                                    {p.discountPercentage}% OFF
                                  </span>
                                ) : (
                                  <span className="text-gray-300 dark:text-gray-600 font-bold text-[10px]">NO SALE</span>
                                )}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${p.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                  <span className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">{p.stock} Units</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-right text-xs font-medium">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setDiscountProduct(p)} className="w-9 h-9 flex items-center justify-center text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm" title="Manage Sale"><DollarSign className="w-4 h-4" /></button>
                                  <button onClick={() => openForm(p)} className="w-9 h-9 flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleProductDelete(p.id)} className="w-9 h-9 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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
          )}

          {/* Sellers Management Tab */}
          {activeTab === 'sellers' && (
            <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Seller Management</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enable or disable seller accounts and view their inventory size.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                  <thead className="bg-[#fcfcfd] dark:bg-gray-900/50">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Seller Identity</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Inventory</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Control</th>
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
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                  <thead className="bg-[#fcfcfd] dark:bg-gray-900/50">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User Account</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Security Role</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Activity Status</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800 transition-all group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs mr-3 border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-black text-gray-900">{u.name}</div>
                              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`px-3 py-1.5 inline-flex text-[10px] font-black uppercase tracking-widest rounded-full 
                                 ${u.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                              u.role === 'seller' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
                            }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`px-3 py-1.5 inline-flex text-[10px] font-black uppercase tracking-widest rounded-full 
                                 ${u.isActive !== false ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                            {u.isActive !== false ? 'Verified Online' : 'Access Restricted'}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-xs font-bold text-gray-500">{u.createdAt || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500">Order ID</th>
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500">Customer</th>
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500">Items</th>
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500">Total</th>
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500">Status</th>
                      <th className="px-8 py-5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500">Actions</th>
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
              </div>
              {filteredOrders.length === 0 && <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">No orders found.</div>}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Contact Messages</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage inquiries from users via the contact form.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                  <thead className="bg-[#fcfcfd] dark:bg-gray-950">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transmission Date</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Originator</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Subject Matter</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Priority Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Control</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {messages.map(msg => (
                      <React.Fragment key={msg.id}>
                        <tr className={`hover:bg-gray-50/80 transition-all ${!msg.isRead ? 'bg-indigo-50/20' : ''}`}>
                          <td className="px-8 py-6 whitespace-nowrap text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className={`text-sm ${!msg.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-500'}`}>{msg.name}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{msg.email}</div>
                          </td>
                          <td className={`px-8 py-6 whitespace-nowrap text-sm ${!msg.isRead ? 'font-black text-indigo-600' : 'font-medium text-gray-600'}`}>
                            {msg.subject || '(No Subject Provided)'}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${msg.isRead ? 'bg-gray-50 text-gray-400 border border-gray-100' : 'bg-indigo-600 text-white border border-indigo-700'}`}>
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

          {activeTab === 'coupons' && (
            <CouponsTab />
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