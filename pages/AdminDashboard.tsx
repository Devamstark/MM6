
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Product, DashboardStats, User as UserType, Order } from '../types';
import { Plus, Edit2, Trash2, Loader2, DollarSign, ShoppingBag, Users, Package, Search, Ban, CheckCircle, XCircle, Filter, Move, GripVertical, Upload, Image as Images, Mail, MessageSquare, Check, Trash } from 'lucide-react';
import { ProductForm } from '../components/ProductForm';
import { SortableProductList } from '../components/SortableProductList';
import { BatchProductCreator } from '../components/BatchProductCreator';
import { AdminAnalytics } from '../components/AdminAnalytics';


export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sellers' | 'users' | 'orders' | 'messages' | 'analytics'>('overview');
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

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12 animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-3 block">Management Portal</span>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-400 font-medium mt-3 text-lg">Real-time insights and product management console.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 font-black">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</p>
              <p className="text-sm font-bold text-gray-900">System Healthy</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-12 w-full animate-fade-up delay-100">
          {['overview', 'products', 'sellers', 'users', 'orders', 'messages', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${activeTab === tab
                ? 'bg-black text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transform -translate-y-1'
                : 'bg-white text-gray-400 hover:text-black hover:bg-gray-50 border border-gray-100'
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={`$${(stats?.totalRevenue ?? 0).toLocaleString()} `}
                  icon={DollarSign}
                  color="text-green-600"
                  bg="bg-green-50"
                  delay={0}
                />
                <StatCard
                  title="Total Units Sold"
                  value={orders.reduce((sum, o) => sum + (o.items?.reduce((isum, i) => isum + (i.quantity || 1), 0) || 0), 0)}
                  icon={ShoppingBag}
                  color="text-blue-600"
                  bg="bg-blue-50"
                  delay={100}
                />
                <StatCard
                  title="Total Users"
                  value={users.length}
                  icon={Users}
                  color="text-purple-600"
                  bg="bg-purple-50"
                  delay={200}
                />
                <StatCard
                  title="Low Stock Alerts"
                  value={products.filter(p => p.stock < 10).length}
                  icon={Package}
                  color="text-orange-600"
                  bg="bg-orange-50"
                  delay={300}
                />
              </div>

              {/* Monthly Sales Trend Chart (Mock) */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 text-lg">Monthly Sales Trend</h3>
                <div className="h-40 flex items-end gap-3 justify-between">
                  {(stats?.monthlyTrend || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).map((h, i) => {
                    const maxVal = Math.max(...(stats?.monthlyTrend || [1]));
                    const heightPercent = maxVal > 0 ? (h / maxVal) * 100 : 0;
                    return (
                      <div key={i} className="w-full bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all duration-300 relative group cursor-pointer" style={{ height: '100%' }}>
                        <div style={{ height: `${heightPercent}% ` }} className="bg-indigo-500 rounded-xl absolute bottom-0 w-full group-hover:bg-indigo-600 transition-colors shadow-sm"></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg whitespace-nowrap z-10">
                          ${typeof h === 'number' ? h.toLocaleString() : h}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <h3 className="font-bold text-gray-900 text-lg mt-8 mb-4">Recent Orders</h3>
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-indigo-600">#{order.id}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">${order.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <>
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-lg text-gray-800">All Products</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsBatchCreatorOpen(true)}
                      className="bg-white border hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all"
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
                      className="bg-white border hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Import ZIP
                    </button>
                    <button onClick={() => setIsReordering(!isReordering)} className={`px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${isReordering ? 'bg-black text-white' : 'bg-white border hover:bg-gray-50'} `}>
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
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-[#fcfcfd]">
                        <tr>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Details</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Vendor</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Valuation</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Campaign</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stock</th>
                          <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Command</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-50">
                        {products.map(p => {
                          const seller = users.find(u => u.id === p.userId);
                          return (
                            <tr key={p.id} className="hover:bg-gray-50/80 transition-all group">
                              <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                                    <img className="h-full w-full object-cover" src={p.imageUrl} alt="" />
                                  </div>
                                  <div className="ml-5">
                                    <div className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{p.name}</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{p.brand}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                  {seller ? seller.name : 'ID: ' + p.userId}
                                </span>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <div className="text-sm font-black text-gray-900">${p.price}</div>
                                {p.salePrice && <div className="text-[10px] text-red-500 font-bold line-through ml-0.5">${p.price}</div>}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                {p.discountPercentage ? (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-green-50 text-green-600 border border-green-100">
                                    {p.discountPercentage}% OFF
                                  </span>
                                ) : (
                                  <span className="text-gray-300 font-bold text-[10px]">NO SALE</span>
                                )}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${p.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                  <span className="text-xs font-black text-gray-600 uppercase tracking-wider">{p.stock} Units</span>
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
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-800">Seller Management</h3>
                <p className="text-sm text-gray-500 mt-1">Enable or disable seller accounts and view their inventory size.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-[#fcfcfd]">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Seller Identity</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Inventory</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Control</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {sellers.map(s => (
                      <tr key={s.id} className={`hover:bg-gray-50/80 transition-all group ${s.isActive === false ? 'bg-gray-50/50 opacity-75' : ''}`}>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs mr-3 border border-indigo-100 group-hover:scale-110 transition-transform">
                              {s.name.charAt(0)}
                            </div>
                            <div className="text-sm font-black text-gray-900">{s.name}</div>
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
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-[#fcfcfd]">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User Account</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Security Role</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Activity Status</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/80 transition-all group">
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
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-bold">Filter by Seller:</span>
                </div>
                <select
                  className="border-none bg-white rounded-lg text-sm p-2 px-4 shadow-sm focus:ring-2 focus:ring-indigo-100"
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
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-[#fcfcfd]">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</th>
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                      <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-8 py-5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-indigo-600">#{order.id}</td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-xs text-gray-500">{order.email}</div>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-500">
                          <div className="text-sm text-gray-900 font-medium">{order.items?.length || 0} Items</div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">${order.totalPrice.toFixed(2)}</div>
                          <div className="text-xs font-medium text-green-600">Paid</div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full capitalize
                                 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && <div className="p-12 text-center text-gray-500 font-medium">No orders found.</div>}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-800">Contact Messages</h3>
                <p className="text-sm text-gray-500 mt-1">Manage inquiries from users via the contact form.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-[#fcfcfd]">
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
                            <div className="bg-[#fcfcfd] p-6 rounded-[1.5rem] text-sm text-gray-600 border border-gray-100 shadow-sm italic leading-relaxed">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Disclosure</span>
                              </div>
                              "{msg.message}"
                              <div className="mt-6 pt-6 border-t border-gray-50">
                                <a href={`mailto:${msg.email}`} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:text-indigo-800 transition-colors">Generate Direct Response &rarr;</a>
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
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Set Sale Discount</h3>
            <p className="text-sm text-gray-500 mb-6">Select a discount percentage for "{discountProduct.name}".</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[10, 20, 30, 40, 50, 60].map(p => (
                <button
                  key={p}
                  onClick={() => applyDiscount(p)}
                  className={`py-3 rounded-xl font-bold border transition-all ${discountProduct.discountPercentage === p
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-600 hover:text-red-600'
                    }`}
                >
                  {p}%
                </button>
              ))}
            </div>

            <button
              onClick={() => applyDiscount(0)}
              className="w-full py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors mb-3"
            >
              Remove Sale
            </button>
            <button
              onClick={() => setDiscountProduct(null)}
              className="w-full py-3 text-gray-500 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Details</h3>
                <p className="font-bold text-gray-900">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-600">{selectedOrder.email}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{selectedOrder.shippingAddress || 'No address provided'}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Info</h3>
                <p className="text-sm text-gray-600">{selectedOrder.paymentMethod || 'Credit Card'}</p>
                <p className="text-xs text-green-600 font-bold mt-1">Paid in Full</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Status</h3>
                <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full capitalize
                                ${selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                  }`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Order Items</h3>
              <div className="space-y-4">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="text-xl font-bold text-indigo-600">${selectedOrder.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                disabled={selectedOrder.status === 'processing' || selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                className="flex-1 bg-yellow-100 text-yellow-700 py-3 rounded-xl font-bold hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Accept Order
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                disabled={selectedOrder.status === 'shipped' || selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Dispatch / Ship
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                className="flex-1 bg-green-100 text-green-700 py-3 rounded-xl font-bold hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark Delivered
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this order?')) {
                    handleStatusUpdate(selectedOrder.id, 'cancelled');
                  }
                }}
                disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                className="flex-1 bg-red-100 text-red-700 py-3 rounded-xl font-bold hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  <div className="bg-white overflow-hidden rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 p-8 flex items-center group animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div className={`w-16 h-16 rounded-[1.5rem] ${bg} ${color} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm`}>
      <Icon className="h-7 w-7" />
    </div>
    <div className="ml-6">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
    </div>
  </div>
);