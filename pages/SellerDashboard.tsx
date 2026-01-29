import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Product, SellerStats, Order } from '../types';
import { Plus, Edit2, Trash2, Loader2, Package, TrendingUp, DollarSign, BarChart2, ShoppingBag, Truck } from 'lucide-react';
import { ProductForm } from '../components/ProductForm';

export const SellerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const [productsData, statsData, ordersData] = await Promise.all([
          api.getProducts({ sellerId: user.id }),
          api.getSellerStats(user.id),
          api.getRecentOrders(user.id)
        ]);
        setProducts(productsData);
        setStats(statsData);
        setOrders(ordersData);
      }
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

  const openModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

  return (
    <div className="bg-[#f0f4f8] min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center animate-fade-up">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Seller Dashboard</h1>
            <p className="text-gray-500 mt-2">Welcome back, {user?.name}. Here is your business overview.</p>
          </div>
          <button onClick={() => openModal()} className="bg-gray-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" /> New Product
          </button>
        </div>

        {/* Analytics & Business Scaling Section */}
        {stats && (
          <div className="mb-10 animate-fade-up delay-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" /> Business Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 animate-fade-up delay-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Total Revenue</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue.toLocaleString()}</div>
                <div className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1">
                  <span className="bg-green-100 px-2 py-0.5 rounded-full">+{stats.revenueGrowth}%</span> from last month
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 animate-fade-up delay-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Total Units Sold</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{stats.unitsSold}</div>
                <div className="text-blue-600 text-xs font-bold mt-2 flex items-center gap-1">
                  <span className="bg-blue-100 px-2 py-0.5 rounded-full">+{stats.unitsGrowth}%</span> from last month
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 animate-fade-up delay-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Conversion Rate</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{stats.conversionRate}%</div>
                <div className="text-purple-600 text-xs font-bold mt-2">Top {stats.conversionGrowth}% of sellers</div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 animate-fade-up delay-400">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Package className="w-6 h-6" /></div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Low Stock Alerts</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{products.filter(p => p.stock < 10).length}</div>
                <div className="text-orange-600 text-xs font-bold mt-2">Items need restocking</div>
              </div>
            </div>

            {/* Visual Sales Chart Simulation */}
            <div className="mt-8 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-fade-up delay-200">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Monthly Sales Trend</h3>
              <div className="h-40 flex items-end gap-3 justify-between">
                {stats.monthlySales.map((h, i) => (
                  <div key={i} className="w-full bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all duration-300 relative group cursor-pointer" style={{ height: '100%' }}>
                    <div style={{ height: `${h}%` }} className="bg-indigo-500 rounded-xl absolute bottom-0 w-full group-hover:bg-indigo-600 transition-colors shadow-sm"></div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg">
                      ${Math.floor(h * 150)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <h2 className="text-xl font-bold text-gray-900 mb-6 animate-fade-up delay-300">Your Inventory</h2>
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-12 animate-fade-up delay-300">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Product Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-14 w-14 flex-shrink-0">
                        <img className="h-14 w-14 rounded-xl object-cover border border-gray-100 group-hover:scale-105 transition-transform duration-300" src={p.imageUrl} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500 font-medium">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-bold border border-gray-100">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(p)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full mr-2 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleProductDelete(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-16 text-center text-gray-500 flex flex-col items-center">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-xl font-bold text-gray-900">No products listed</p>
              <p className="text-sm text-gray-500 mb-6">Get started by adding your first product to the marketplace.</p>
              <button onClick={() => openModal()} className="text-indigo-600 font-bold hover:underline">Add Product</button>
            </div>
          )}
        </div>

        {/* Recent Orders Section */}
        <h2 className="text-xl font-bold text-gray-900 mb-6 animate-fade-up delay-400">Recent Orders</h2>
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-up delay-400">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Items to Fulfill</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {orders.map(order => {
                // Only show items belonging to this seller
                const sellerItems = order.items?.filter(item => item.userId === user?.id) || [];

                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-2">
                        {sellerItems.map((item: any, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-white flex-shrink-0 overflow-hidden border border-gray-200">
                              <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                              <span className="text-xs text-gray-500 font-medium">Qty: {item.quantity || 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                               ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{order.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-medium">{order.customerName}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-16 text-center text-gray-500 flex flex-col items-center">
              <Truck className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-lg font-medium text-gray-900">No orders yet</p>
              <p className="text-sm text-gray-500">Orders for your products will appear here.</p>
            </div>
          )}
        </div>

        {/* Modal */}
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
    </div>
  );
};