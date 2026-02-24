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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const [productsRes, statsData, ordersData] = await Promise.all([
          api.getProducts({ sellerId: user.id }),
          api.getSellerStats(user.id),
          api.getRecentOrders(user.id)
        ]);
        setProducts((productsRes as any).results || []);
        setHasMore(!!(productsRes as any).next);
        setPage(1);
        setStats(statsData);
        setOrders(ordersData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !user?.id) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await api.getProducts({ sellerId: user.id, page: nextPage });
      setProducts(prev => [...prev, ...((res as any).results || [])]);
      setPage(nextPage);
      setHasMore(!!(res as any).next);
    } catch (err) {
      console.error('Failed to load more products:', err);
    } finally {
      setLoadingMore(false);
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

  if (loading) return <div className="p-10 flex justify-center bg-gray-50 dark:bg-slate-950 transition-colors"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" /></div>;

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center animate-fade-up">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Seller Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Welcome back, {user?.name}. Here is your business overview.</p>
          </div>
          <button onClick={() => openModal()} className="bg-gray-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-200 dark:hover:shadow-white/20 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" /> New Product
          </button>
        </div>

        {/* Analytics & Business Scaling Section */}
        {stats && (
          <div className="mb-10 animate-fade-up delay-100">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Business Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-up delay-100 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl"><DollarSign className="w-6 h-6" /></div>
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wide">Total Revenue</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${stats.totalRevenue.toLocaleString()}</div>
                <div className="text-green-600 dark:text-green-400 text-xs font-bold mt-2 flex items-center gap-1">
                  <span className="bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">+{stats.revenueGrowth}%</span> from last month
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-up delay-200 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wide">Total Units Sold</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.unitsSold}</div>
                <div className="text-blue-600 dark:text-blue-400 text-xs font-bold mt-2 flex items-center gap-1">
                  <span className="bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">+{stats.unitsGrowth}%</span> from last month
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-up delay-300 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wide">Conversion Rate</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.conversionRate}%</div>
                <div className="text-purple-600 dark:text-purple-400 text-xs font-bold mt-2">Top {stats.conversionGrowth}% of sellers</div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-up delay-400 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl"><Package className="w-6 h-6" /></div>
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wide">Low Stock Alerts</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{products.filter(p => p.stock < 10).length}</div>
                <div className="text-orange-600 dark:text-orange-400 text-xs font-bold mt-2">Items need restocking</div>
              </div>
            </div>

            {/* Visual Sales Chart Simulation */}
            <div className="mt-8 bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-up delay-200 transition-colors">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Monthly Sales Trend</h3>
              <div className="h-40 flex items-end gap-3 justify-between">
                {stats.monthlySales.map((h, i) => (
                  <div key={i} className="w-full bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all duration-300 relative group cursor-pointer" style={{ height: '100%' }}>
                    <div style={{ height: `${h}%` }} className="bg-indigo-500 rounded-xl absolute bottom-0 w-full group-hover:bg-indigo-600 transition-colors shadow-sm"></div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg">
                      ${Math.floor(h * 150)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-up delay-300">Your Inventory</h2>
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-12 animate-fade-up delay-300 transition-colors">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-white dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Product Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Stock</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-14 w-14 flex-shrink-0">
                        <img className="h-14 w-14 rounded-xl object-cover border border-gray-100 dark:border-gray-800 group-hover:scale-105 transition-transform duration-300" src={p.imageUrl} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold border border-gray-100 dark:border-gray-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-200">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(p)} className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-2 rounded-full mr-2 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleProductDelete(p.id)} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">No products listed</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first product to the marketplace.</p>
              <button onClick={() => openModal()} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Add Product</button>
            </div>
          )}
          {hasMore && products.length > 0 && (
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingMore ? 'Loading...' : 'Load More Products'}
              </button>
            </div>
          )}
        </div>

        {/* Recent Orders Section */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-up delay-400">Recent Orders</h2>
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-up delay-400 transition-colors">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-white dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Items to Fulfill</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Customer</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
              {orders.map(order => {
                // Only show items belonging to this seller
                const sellerItems = order.items?.filter(item => item.userId === user?.id) || [];

                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                      <div className="space-y-2">
                        {sellerItems.map((item: any, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-white dark:bg-gray-900 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                              <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Qty: {item.quantity || 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full
                               ${order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                          order.status === 'shipped' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">{order.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400 font-medium">{order.customerName}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
              <Truck className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">No orders yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Orders for your products will appear here.</p>
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