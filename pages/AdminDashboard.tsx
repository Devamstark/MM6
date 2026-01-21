import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product, DashboardStats, User as UserType, Order } from '../types';
import { Plus, Edit2, Trash2, Loader2, DollarSign, ShoppingBag, Users, Package, Search, Ban, CheckCircle, Filter } from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sellers' | 'users' | 'orders'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [sellerFilter, setSellerFilter] = useState<string>('');

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', brand: '', imageUrl: '', stock: '', isFeatured: false, isPopular: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, productsData, usersData, ordersData] = await Promise.all([
        api.getDashboardStats(),
        api.getProducts(),
        api.getUsers(),
        api.getRecentOrders()
      ]);
      setStats(statsData);
      setProducts(productsData);
      setUsers(usersData);
      setOrders(ordersData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProductDelete = async (id: number) => {
    if (window.confirm('Delete this product?')) {
      await api.deleteProduct(id);
      loadData();
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean | undefined) => {
    try {
      // If status is undefined, treat as true
      const newStatus = !(currentStatus ?? true);
      await api.updateUserStatus(userId, newStatus);
      loadData(); // Refresh list
    } catch (e) {
      console.error(e);
      alert('Failed to update user status');
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, description: product.description, price: product.price.toString(),
        category: product.category, brand: product.brand, imageUrl: product.imageUrl,
        stock: product.stock.toString(), isFeatured: product.isFeatured, isPopular: product.isPopular
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', brand: '', imageUrl: '', stock: '', isFeatured: false, isPopular: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };
    try {
      if (editingProduct) await api.updateProduct(editingProduct.id, payload);
      else await api.createProduct(payload);
      setIsModalOpen(false);
      loadData();
    } catch (err) { alert('Error saving product'); }
  };

  // derived state
  const sellers = users.filter(u => u.role === 'seller');
  const getSellerProductCount = (sellerId: number) => products.filter(p => p.userId === sellerId).length;

  const filteredOrders = sellerFilter 
    ? orders.filter(order => order.items?.some(item => item.userId === parseInt(sellerFilter)))
    : orders;

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;

  return (
    <div className="bg-[#f0f4f8] min-h-screen pb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Overview of store performance and management.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-white p-1.5 rounded-full shadow-sm mb-8 w-fit border border-gray-100 overflow-x-auto animate-fade-up delay-100">
          {['overview', 'products', 'sellers', 'users', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-up delay-200">
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-600" bg="bg-green-50" delay={0} />
            <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-50" delay={100} />
            <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="text-orange-600" bg="bg-orange-50" delay={200} />
            <StatCard title="Total Users" value={stats.totalUsers || 0} icon={Users} color="text-purple-600" bg="bg-purple-50" delay={300} />
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-800">All Products</h3>
                <button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
                   <Plus className="w-4 h-4" /> Add Product
                </button>
             </div>
             <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white">
                   <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Seller</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                   {products.map(p => {
                      const seller = users.find(u => u.id === p.userId);
                      return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                               <img className="h-12 w-12 rounded-xl object-cover border border-gray-100" src={p.imageUrl} alt="" />
                               <div className="ml-4">
                                  <div className="text-sm font-bold text-gray-900">{p.name}</div>
                                  <div className="text-xs text-gray-500 font-medium">{p.brand}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                           {seller ? seller.name : 'Unknown (ID: ' + p.userId + ')'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${p.price}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.stock}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => openModal(p)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full mr-1 transition-colors"><Edit2 className="w-4 h-4"/></button>
                            <button onClick={() => handleProductDelete(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"><Trash2 className="w-4 h-4"/></button>
                         </td>
                      </tr>
                   )})}
                </tbody>
             </table>
          </div>
        )}

        {/* Sellers Management Tab */}
        {activeTab === 'sellers' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-800">Seller Management</h3>
                <p className="text-sm text-gray-500 mt-1">Enable or disable seller accounts and view their inventory size.</p>
             </div>
             <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white">
                   <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Seller Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                   {sellers.map(s => (
                      <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${s.isActive === false ? 'bg-gray-50/80 opacity-75' : ''}`}>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{s.name}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{s.email}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{getSellerProductCount(s.id)}</td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                               ${s.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {s.isActive !== false ? 'Active' : 'Disabled'}
                            </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => toggleUserStatus(s.id, s.isActive)}
                              className={`flex items-center gap-1.5 ml-auto px-4 py-2 rounded-full border transition-all text-xs font-bold ${s.isActive !== false 
                                ? 'text-red-600 border-red-100 hover:bg-red-50' 
                                : 'text-green-600 border-green-100 hover:bg-green-50'}`}
                            >
                              {s.isActive !== false ? <><Ban className="w-3 h-3" /> Disable</> : <><CheckCircle className="w-3 h-3" /> Enable</>}
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
             {sellers.length === 0 && <div className="p-12 text-center text-gray-500 font-medium">No sellers found.</div>}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
             <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white">
                   <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                   {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{u.name}</div>
                            <div className="text-xs text-gray-500 font-medium">{u.email}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                               ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                 u.role === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                               {u.role.toUpperCase()}
                            </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                               ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                               {u.isActive !== false ? 'Active' : 'Disabled'}
                            </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{u.createdAt || 'N/A'}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
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
             <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white">
                   <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Items & Fulfillment</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                   {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">#{order.id}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{order.customerName}</td>
                         <td className="px-6 py-4 text-sm text-gray-500">
                           <div className="space-y-2">
                             {order.items?.map((item, idx) => {
                               const seller = users.find(u => u.id === item.userId);
                               return (
                                 <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                                   <span className="font-bold text-gray-700 truncate max-w-[150px]">{item.name}</span>
                                   <span className="text-indigo-500 font-medium text-[10px] ml-2">Sold by: {seller?.name || 'Unknown'}</span>
                                 </div>
                               )
                             })}
                             {(!order.items || order.items.length === 0) && <span className="text-gray-400 italic">No items details</span>}
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${order.totalPrice.toFixed(2)}</td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                               ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                 order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                               {order.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{order.createdAt}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
             {filteredOrders.length === 0 && <div className="p-12 text-center text-gray-500 font-medium">No orders found.</div>}
           </div>
        )}
        </div>

      </div>
      
      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 animate-scale-in">
             <h3 className="text-2xl font-bold mb-6 text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                   <input className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                   <input className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Stock" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                   <input className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
                </div>
                <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Image URL" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} required />
                <textarea className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Description" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <div className="flex justify-end gap-3 pt-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                   <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">Save</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg, delay }: any) => (
  <div className="bg-white overflow-hidden rounded-[2rem] shadow-sm border border-gray-100 p-6 flex items-center animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div className={`p-4 rounded-2xl ${bg} ${color} mr-5`}>
      <Icon className="h-8 w-8" />
    </div>
    <div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  </div>
);