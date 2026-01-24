import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Product, SellerStats, Order } from '../types';
import { Plus, Edit2, Trash2, Loader2, Package, TrendingUp, DollarSign, BarChart2, Upload, Image as ImageIcon, ShoppingBag, Truck } from 'lucide-react';

export const SellerDashboard = () => {
  // Fixed Categories Structure
  const CATEGORIES = {
    'Women': ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'],
    'Men': ['Tops', 'Bottoms', 'Outerwear', 'Suits', 'Shoes', 'Accessories'],
    'Kids': ['Boys', 'Girls', 'Baby'],
    'Accessories': ['Bags', 'Jewelry', 'Watches', 'Sunglasses']
  };

  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<{
    name: string; description: string; price: string; category: string; subcategory: string;
    brand: string; imageUrl: string; stock: string; gender: string; sizes: string; colors: string;
    imageFile?: File;
  }>({
    name: '', description: '', price: '', category: '', subcategory: '', brand: '', imageUrl: '', stock: '',
    gender: 'Unisex', sizes: '', colors: ''
  });

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
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        subcategory: product.subcategory || '',
        brand: product.brand,
        imageUrl: product.imageUrl,
        stock: product.stock.toString(),
        gender: product.gender || 'Unisex',
        sizes: product.sizes ? product.sizes.join(', ') : '',
        colors: product.colors ? product.colors.join(', ') : ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', description: '', price: '', category: '', subcategory: '', brand: '', imageUrl: '', stock: '',
        gender: 'Unisex', sizes: '', colors: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result as string, // keep preview
          imageFile: file // store actual file for upload
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
      isFeatured: editingProduct ? editingProduct.isFeatured : false,
      isPopular: editingProduct ? editingProduct.isPopular : false,
      imageFile: formData.imageFile // Pass the file
    };
    try {
      if (editingProduct) await api.updateProduct(editingProduct.id, payload);
      else await api.createProduct(payload);
      setIsModalOpen(false);
      loadData();
    } catch (err) { alert('Error saving product'); }
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
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'List New Product'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors text-2xl">×</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Product Name</label>
                  <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="e.g. Wireless Headphones" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Price ($)</label>
                    <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Stock Quantity</label>
                    <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" type="number" placeholder="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Category</label>
                    <select
                      className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                      required
                    >
                      <option value="">Select Category</option>
                      {Object.keys(CATEGORIES).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Sub-Category</label>
                    <select
                      className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all"
                      value={formData.subcategory}
                      onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                      disabled={!formData.category}
                    >
                      <option value="">Select Sub-Category</option>
                      {formData.category && (CATEGORIES as any)[formData.category]?.map((sub: string) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Brand</label>
                    <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Brand Name" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Gender</label>
                    <select className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                      <option value="Unisex">Unisex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Sizes (comma separated)</label>
                    <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="S, M, L, XL" value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Colors (comma separated)</label>
                    <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Red, Blue, Green" value={formData.colors} onChange={e => setFormData({ ...formData, colors: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Product Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer relative group">
                    <div className="space-y-1 text-center">
                      {formData.imageUrl ? (
                        <div className="relative">
                          <img src={formData.imageUrl} alt="Preview" className="h-32 object-contain mx-auto rounded-lg shadow-sm" />
                          <p className="text-xs text-gray-500 mt-2 font-medium group-hover:text-indigo-600 transition-colors">Click to replace</p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                          <div className="flex text-sm text-gray-600 justify-center mt-2">
                            <span className="relative cursor-pointer font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                              <span>Upload a file</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </>
                      )}
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Description</label>
                  <textarea className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Describe your product..." rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 hover:-translate-y-0.5 transition-all">
                    <Upload className="w-4 h-4" /> Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};