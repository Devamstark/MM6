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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Overview of store performance and management.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 w-fit border border-gray-200 overflow-x-auto">
          {['overview', 'products', 'sellers', 'users', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-600" bg="bg-green-100" />
            <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-100" />
            <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="text-orange-600" bg="bg-orange-100" />
            <StatCard title="Total Users" value={stats.totalUsers || 0} icon={Users} color="text-purple-600" bg="bg-purple-100" />
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">All Products</h3>
                <button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                   <Plus className="w-4 h-4" /> Add Product
                </button>
             </div>
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                   <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {products.map(p => {
                      const seller = users.find(u => u.id === p.userId);
                      return (
                      <tr key={p.id}>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                               <img className="h-10 w-10 rounded-lg object-cover" src={p.imageUrl} alt="" />
                               <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                  <div className="text-xs text-gray-500">{p.brand}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {seller ? seller.name : 'Unknown (ID: ' + p.userId + ')'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${p.price}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.stock}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => openModal(p)} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit2 className="w-4 h-4"/></button>
                            <button onClick={() => handleProductDelete(p.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4"/></button>
                         </td>
                      </tr>
                   )})}
                </tbody>
             </table>
          </div>
        )}

        {/* Sellers Management Tab */}
        {activeTab === 'sellers' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">Seller Management</h3>
                <p className="text-xs text-gray-500">Enable or disable seller accounts and view their inventory size.</p>
             </div>
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                   <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {sellers.map(s => (
                      <tr key={s.id} className={s.isActive === false ? 'bg-gray-50 opacity-75' : ''}>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.email}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{getSellerProductCount(s.id)}</td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                               ${s.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                               {s.isActive !== false ? 'Active' : 'Disabled'}
                            </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => toggleUserStatus(s.id, s.isActive)}
                              className={`flex items-center gap-1 ml-auto px-3 py-1 rounded border transition-colors ${s.isActive !== false 
                                ? 'text-red-600 border-red-200 hover:bg-red-50' 
                                : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                            >
                              {s.isActive !== false ? <><Ban className="w-3 h-3" /> Disable</> : <><CheckCircle className="w-3 h-3" /> Enable</>}
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
             {sellers.length === 0 && <div className="p-8 text-center text-gray-500">No sellers found.</div>}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                   <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {users.map(u => (
                      <tr key={u.id}>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{u.name}</div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                               ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                 u.role === 'seller' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                               {u.role}
                            </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                               ${u.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                               {u.isActive !== false ? 'Active' : 'Disabled'}
                            </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.createdAt || 'N/A'}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
        
        {activeTab === 'orders' && (
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filter by Seller:</span>
                </div>
                <select 
                  className="border border-gray-300 rounded-md text-sm p-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                  value={sellerFilter}
                  onChange={(e) => setSellerFilter(e.target.value)}
                >
                  <option value="">All Sellers</option>
                  {sellers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
             </div>
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                   <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items & Fulfillment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {filteredOrders.map(order => (
                      <tr key={order.id}>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                         <td className="px-6 py-4 text-sm text-gray-500">
                           <div className="space-y-1">
                             {order.items?.map((item, idx) => {
                               const seller = users.find(u => u.id === item.userId);
                               return (
                                 <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-1 rounded">
                                   <span className="font-medium truncate max-w-[150px]">{item.name}</span>
                                   <span className="text-gray-400 text-[10px] ml-2">Sold by: {seller?.name || 'Unknown'}</span>
                                 </div>
                               )
                             })}
                             {(!order.items || order.items.length === 0) && <span className="text-gray-400 italic">No items details</span>}
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalPrice.toFixed(2)}</td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                               ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                 order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                               {order.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.createdAt}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
             {filteredOrders.length === 0 && <div className="p-8 text-center text-gray-500">No orders found.</div>}
           </div>
        )}

      </div>
      
      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in">
             <h3 className="text-lg font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <input className="w-full border rounded p-2" placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                   <input className="border rounded p-2" placeholder="Price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                   <input className="border rounded p-2" placeholder="Stock" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input className="border rounded p-2" placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                   <input className="border rounded p-2" placeholder="Brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
                </div>
                <input className="w-full border rounded p-2" placeholder="Image URL" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} required />
                <textarea className="w-full border rounded p-2" placeholder="Description" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <div className="flex justify-end gap-2">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                   <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
    <div className={`p-3 rounded-full ${bg} ${color} mr-4`}>
      <Icon className="h-8 w-8" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);