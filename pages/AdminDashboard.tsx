import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product, DashboardStats, User as UserType, Order } from '../types';
import { Plus, Edit2, Trash2, Loader2, DollarSign, ShoppingBag, Users, Package, Search, Ban, CheckCircle, Filter } from 'lucide-react';
import { ProductForm } from '../components/ProductForm';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sellers' | 'users' | 'orders'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [sellerFilter, setSellerFilter] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const handleProductDelete = async (id: string) => {
    if (window.confirm('Delete this product?')) {
      await api.deleteProduct(id);
      loadData();
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

  const openModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
  };

  // derived state
  const sellers = users.filter(u => u.role === 'seller');
  const getSellerProductCount = (sellerId: number) => products.filter(p => p.userId === sellerId).length;

  const filteredOrders = sellerFilter
    ? orders.filter(order => order.items?.some(item => item.userId === parseInt(sellerFilter)))
    : orders;

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

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
              className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Total Revenue</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    ${orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString()}
                  </div>
                  <div className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1">
                    <span className="bg-green-100 px-2 py-0.5 rounded-full">+12%</span> from last month
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Total Units Sold</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {orders.reduce((sum, o) => sum + (o.items?.reduce((isum, i) => isum + (i.quantity || 1), 0) || 0), 0)}
                  </div>
                  <div className="text-blue-600 text-xs font-bold mt-2 flex items-center gap-1">
                    <span className="bg-blue-100 px-2 py-0.5 rounded-full">+5%</span> from last month
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users className="w-6 h-6" /></div>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Total Users</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{users.length}</div>
                  <div className="text-purple-600 text-xs font-bold mt-2">
                    {users.filter(u => u.role === 'seller').length} Sellers
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Package className="w-6 h-6" /></div>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Low Stock Alerts</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{products.filter(p => p.stock < 10).length}</div>
                  <div className="text-orange-600 text-xs font-bold mt-2">Items need restocking</div>
                </div>
              </div>

              {/* Monthly Sales Trend Chart (Mock) */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 text-lg">Monthly Sales Trend</h3>
                <div className="h-40 flex items-end gap-3 justify-between">
                  {[65, 59, 80, 81, 56, 55, 40, 70, 90, 100, 85, 120].map((h, i) => (
                    <div key={i} className="w-full bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all duration-300 relative group cursor-pointer" style={{ height: '100%' }}>
                      <div style={{ height: `${(h / 150) * 100}%` }} className="bg-indigo-500 rounded-xl absolute bottom-0 w-full group-hover:bg-indigo-600 transition-colors shadow-sm"></div>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg">
                        ${h * 100}
                      </div>
                    </div>
                  ))}
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
                          <button onClick={() => openModal(p)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full mr-1 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleProductDelete(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    )
                  })}
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
                          // User toggle is not defined but we can skip implementation or add dummy
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
                              <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-colors">
                                <div className="h-10 w-10 rounded-lg bg-white flex-shrink-0 overflow-hidden border border-gray-200">
                                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900 text-xs">{item.name}</span>
                                  <span className="text-indigo-500 font-medium text-[10px]">Seller: {seller?.name || 'Unknown'}</span>
                                  <span className="text-gray-400 text-[10px]">Qty: {item.quantity || 1}</span>
                                </div>
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
        <ProductForm
          initialData={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => {
            setIsModalOpen(false);
            loadData();
          }}
        />
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