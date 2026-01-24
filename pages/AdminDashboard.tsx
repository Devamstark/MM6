import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product, DashboardStats, User as UserType, Order } from '../types';
import { Plus, Edit2, Trash2, Loader2, DollarSign, ShoppingBag, Users, Package, Search, Ban, CheckCircle, Filter } from 'lucide-react';

export const AdminDashboard = () => {
  // Categories structure
  const CATEGORIES = {
    'Women': ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'],
    'Men': ['Tops', 'Bottoms', 'Outerwear', 'Suits', 'Shoes', 'Accessories'],
    'Kids': ['Boys', 'Girls', 'Baby'],
    'Accessories': ['Bags', 'Jewelry', 'Watches', 'Sunglasses']
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sellers' | 'users' | 'orders'>('overview');
  // ... (stats, etc) ...
  const [loading, setLoading] = useState(true);

  // Filters
  const [sellerFilter, setSellerFilter] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<{
    name: string; description: string; price: string; category: string; subcategory: string;
    brand: string; imageUrl: string; stock: string; gender: string; sizes: string; colors: string;
    isFeatured: boolean; isPopular: boolean; imageFile?: File;
  }>({
    name: '', description: '', price: '', category: '', subcategory: '', brand: '', imageUrl: '', stock: '',
    gender: 'Unisex', sizes: '', colors: '', isFeatured: false, isPopular: false
  });

  // ... (useEffect, loadData, handleDelete, toggleStatus match existing logic)

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, description: product.description, price: product.price.toString(),
        category: product.category, subcategory: product.subcategory || '', brand: product.brand,
        imageUrl: product.imageUrl, stock: product.stock.toString(),
        gender: product.gender || 'Unisex',
        sizes: product.sizes ? product.sizes.join(', ') : '',
        colors: product.colors ? product.colors.join(', ') : '',
        isFeatured: product.isFeatured, isPopular: product.isPopular
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', description: '', price: '', category: '', subcategory: '', brand: '', imageUrl: '', stock: '',
        gender: 'Unisex', sizes: '', colors: '', isFeatured: false, isPopular: false
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
          imageUrl: reader.result as string,
          imageFile: file
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
      imageFile: formData.imageFile
    };
    try {
      if (editingProduct) await api.updateProduct(editingProduct.id, payload);
      else await api.createProduct(payload);
      setIsModalOpen(false);
      loadData();
    } catch (err) { alert('Error saving product'); }
  };

  // ... (render logic, tabs) ...

  {/* Product Modal */ }
  {
    isModalOpen && (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 animate-scale-in">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Product Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <input className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Price" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
              <input className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Stock" type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value, subcategory: '' })} required>
                <option value="">Category</option>
                {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" value={formData.subcategory} onChange={e => setFormData({ ...formData, subcategory: e.target.value })} disabled={!formData.category}>
                <option value="">Sub-Category</option>
                {formData.category && (CATEGORIES as any)[formData.category]?.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Brand" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
              <select className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                <option value="Unisex">Unisex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Sizes (e.g. S, M)" value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} />
              <input className="bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Colors (e.g. Red)" value={formData.colors} onChange={e => setFormData({ ...formData, colors: e.target.value })} />
            </div>

            {/* Image Upload */}
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer relative group">
              <div className="space-y-1 text-center">
                {formData.imageUrl ? (
                  <div className="relative">
                    <img src={formData.imageUrl} alt="Preview" className="h-32 object-contain mx-auto rounded-lg shadow-sm" />
                    <p className="text-xs text-gray-500 mt-2">Click to change</p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <span className="block text-sm font-bold text-indigo-600">Upload Image</span>
                    <span className="text-xs">PNG, JPG up to 10MB</span>
                  </div>
                )}
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
              </div>
            </div>

            <textarea className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Description" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">Save</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

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