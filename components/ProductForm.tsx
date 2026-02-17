import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { Upload, Trash2, Plus, Image as ImageIcon, X, Package, Check, ShoppingBag, Timer } from 'lucide-react';
import { CATEGORIES, MAIN_CATEGORIES } from '../utils/categories';

interface ProductFormProps {
    initialData?: Product | null;
    onClose: () => void;
    onSubmit: () => void;
    isInline?: boolean; // New prop for inline mode
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onClose, onSubmit, isInline = false }) => {
    // Remove old state for categories/subcategories as we use constants now
    // convert dbSubcategories to simple derived state or use effect if needed

    const [subcats, setSubcats] = useState<string[]>([]);

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        price: string;
        category: string;
        subcategory: string;
        brand: string;
        imageUrl: string;
        stock: string;
        gender: string;
        sizes: string;
        colors: string;
        imageFile?: File;
        additionalImages: (string | File)[];
        isFeatured: boolean;
        isPopular: boolean;
        cogs: string;
        marketing_cost: string;
        shipping_cost: string;
        flashSaleStart: string;
        flashSaleEnd: string;
        variants: { size: string; color: string; stock: number }[];
    }>({
        name: '', description: '', price: '', category: '', subcategory: '', brand: '', imageUrl: '', stock: '',
        gender: 'Unisex', sizes: '', colors: '', additionalImages: [], isFeatured: false, isPopular: false,
        variants: [], cogs: '0', marketing_cost: '0', shipping_cost: '0',
        flashSaleStart: '', flashSaleEnd: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                price: initialData.price.toString(),
                category: initialData.category,
                subcategory: initialData.subcategory || '',
                brand: initialData.brand,
                imageUrl: initialData.imageUrl,
                stock: initialData.stock.toString(),
                gender: initialData.gender || 'Unisex',
                sizes: initialData.sizes ? initialData.sizes.join(', ') : '',
                colors: initialData.colors ? initialData.colors.join(', ') : '',
                imageFile: undefined,
                additionalImages: initialData.additionalImages || [],
                isFeatured: initialData.isFeatured || false,
                isPopular: initialData.isPopular || false,
                variants: initialData.variants || [],
                cogs: initialData.cogs?.toString() || '0',
                marketing_cost: initialData.marketingCost?.toString() || '0',
                shipping_cost: initialData.shippingCost?.toString() || '0',
                flashSaleStart: initialData.flashSaleStart ? new Date(initialData.flashSaleStart).toISOString().slice(0, 16) : '',
                flashSaleEnd: initialData.flashSaleEnd ? new Date(initialData.flashSaleEnd).toISOString().slice(0, 16) : ''
            });
        }
    }, [initialData]);

    // Update subcategories when category changes
    useEffect(() => {
        if (formData.category && CATEGORIES[formData.category]) {
            setSubcats(CATEGORIES[formData.category]);
        } else {
            setSubcats([]);
        }
    }, [formData.category]);

    const generateVariants = () => {
        const sizeList = formData.sizes.split(',').map(s => s.trim()).filter(s => s);
        const colorList = formData.colors.split(',').map(c => c.trim()).filter(c => c);

        if (sizeList.length === 0 && colorList.length === 0) return;

        const newVariants: { size: string; color: string; stock: number }[] = [];

        if (sizeList.length > 0 && colorList.length > 0) {
            sizeList.forEach(size => {
                colorList.forEach(color => {
                    const existing = formData.variants.find(v => v.size === size && v.color === color);
                    newVariants.push(existing || { size, color, stock: 0 });
                });
            });
        } else if (sizeList.length > 0) {
            sizeList.forEach(size => {
                const existing = formData.variants.find(v => v.size === size && v.color === 'N/A');
                newVariants.push(existing || { size, color: 'N/A', stock: 0 });
            });
        } else if (colorList.length > 0) {
            colorList.forEach(color => {
                const existing = formData.variants.find(v => v.size === 'N/A' && v.color === color);
                newVariants.push(existing || { size: 'N/A', color, stock: 0 });
            });
        }

        // When generating variants, update total stock to match sum of variants
        const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);

        setFormData(prev => ({ ...prev, variants: newVariants, stock: totalStock.toString() }));
    };

    const handleVariantStockChange = (idx: number, val: string) => {
        const newVariants = [...formData.variants];
        newVariants[idx].stock = parseInt(val) || 0;

        const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);

        setFormData(prev => ({
            ...prev,
            variants: newVariants,
            stock: totalStock.toString()
        }));
    };

    const handleSimpleStockChange = (val: string) => {
        setFormData(prev => ({ ...prev, stock: val }));
    }

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
            imageFile: formData.imageFile,
            additionalImages: formData.additionalImages,
            variants: formData.variants,
            cogs: parseFloat(formData.cogs),
            marketing_cost: parseFloat(formData.marketing_cost),
            shipping_cost: parseFloat(formData.shipping_cost),
            flash_sale_start: formData.flashSaleStart || null,
            flash_sale_end: formData.flashSaleEnd || null
        };

        try {
            if (initialData) await api.updateProduct(initialData.id, payload);
            else await api.createProduct(payload);
            onSubmit();
        } catch (err: any) {
            console.error('Error saving product:', err);
            alert('Error saving product');
        }
    };

    const Content = (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-8">
                <section className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <Plus className="w-5 h-5" />
                        </div>
                        <h4 className="font-black text-gray-900 uppercase tracking-tight">Main Information</h4>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Product Title</label>
                            <input className="w-full bg-white border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-bold text-lg outline-none shadow-sm" placeholder="e.g. Premium Cotton T-Shirt" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Product Description</label>
                            <textarea className="w-full bg-white border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none shadow-sm" placeholder="Tell the story of your product..." rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Base Price ($)</label>
                            <input className="w-full bg-white border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-bold text-lg outline-none shadow-sm" type="number" step="0.01" placeholder="0.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Brand Name</label>
                            <input className="w-full bg-white border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-bold outline-none shadow-sm" placeholder="Brand Name" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all appearance-none font-bold outline-none shadow-sm cursor-pointer"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {MAIN_CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sub-Category</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all appearance-none font-bold outline-none shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={formData.subcategory}
                                    onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                                    disabled={!formData.category}
                                    required
                                >
                                    <option value="">Select Sub-Category</option>
                                    {subcats.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <Package className="w-5 h-5" />
                        </div>
                        <h4 className="font-black text-gray-900 uppercase tracking-tight">Inventory & Variants</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sizes</label>
                            <input className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-100 outline-none font-mono text-xs shadow-sm" placeholder="S, M, L, XL" value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} />
                            <p className="text-[10px] text-gray-400 mt-1 italic">Comma separated values</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Colors</label>
                            <input className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-100 outline-none font-mono text-xs shadow-sm" placeholder="Black, White, Navy" value={formData.colors} onChange={e => setFormData({ ...formData, colors: e.target.value })} />
                        </div>
                    </div>

                    <button type="button" onClick={generateVariants} className="w-full py-4 bg-white border-2 border-dashed border-indigo-200 rounded-2xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all flex items-center justify-center gap-2 group">
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        {formData.variants.length > 0 ? 'Update Variants Matrix' : 'Generate Variants Matrix'}
                    </button>

                    {formData.variants.length > 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Size</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Color</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Stock Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {formData.variants.map((v, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-2.5 text-xs font-bold text-gray-900">{v.size}</td>
                                            <td className="px-4 py-2.5 text-xs font-bold text-gray-600">{v.color}</td>
                                            <td className="px-4 py-2.5">
                                                <input
                                                    type="number"
                                                    className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
                                                    value={v.stock}
                                                    onChange={(e) => handleVariantStockChange(i, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Total Stock</label>
                            <input
                                type="number"
                                className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100"
                                value={formData.stock}
                                onChange={(e) => handleSimpleStockChange(e.target.value)}
                                placeholder="Total units available"
                            />
                        </div>
                    )}
                </section>
            </div>

            {/* Right Column: Assets & Toggles */}
            <div className="space-y-8">
                <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Visual Assets</h4>

                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="aspect-square w-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400 group-hover:bg-gray-100">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <ImageIcon className="w-8 h-8" />
                                        <span className="text-xs font-bold">Cover Image</span>
                                    </div>
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {formData.additionalImages.map((img, i) => (
                                <div key={i} className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative group border border-gray-100">
                                    <img src={img instanceof File ? URL.createObjectURL(img) : img} className="w-full h-full object-cover" />
                                    <button type="button" className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={() => {
                                        const imgs = [...formData.additionalImages];
                                        imgs.splice(i, 1);
                                        setFormData({ ...formData, additionalImages: imgs });
                                    }}><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-300 hover:text-indigo-500 hover:border-indigo-200">
                                <Plus className="w-6 h-6" />
                                <input type="file" multiple className="hidden" onChange={e => {
                                    if (e.target.files) setFormData({ ...formData, additionalImages: [...formData.additionalImages, ...Array.from(e.target.files)] })
                                }} />
                            </label>
                        </div>
                    </div>
                </section>

                <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Visibility & Status</h4>
                    <div className="grid grid-cols-1 gap-3">
                        <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 border border-transparent transition-all">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                                checked={formData.isFeatured}
                                onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                            />
                            <span className="text-sm font-bold text-gray-700">Badge as Featured</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 border border-transparent transition-all">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                                checked={formData.isPopular}
                                onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                            />
                            <span className="text-sm font-bold text-gray-700">Mark as Trending</span>
                        </label>
                    </div>
                </section>

                <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                            <Timer className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Flash Sale Timer</h4>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Start Time</label>
                            <input
                                type="datetime-local"
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-100 outline-none font-mono text-xs shadow-sm text-gray-600"
                                value={formData.flashSaleStart}
                                onChange={e => setFormData({ ...formData, flashSaleStart: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">End Time</label>
                            <input
                                type="datetime-local"
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-100 outline-none font-mono text-xs shadow-sm text-gray-600"
                                value={formData.flashSaleEnd}
                                onChange={e => setFormData({ ...formData, flashSaleEnd: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                <section className="bg-black text-white p-6 rounded-[2rem] shadow-xl space-y-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">Financial Insights</h4>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">COGS ($)</label>
                            <input type="number" step="0.01" className="w-full bg-white/10 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-white/20 transition-all outline-none" placeholder="Cost of Goods" value={formData.cogs} onChange={(e) => setFormData({ ...formData, cogs: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ads ($)</label>
                                <input type="number" step="0.01" className="w-full bg-white/10 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-white/20 transition-all outline-none" placeholder="Marketing" value={formData.marketing_cost} onChange={(e) => setFormData({ ...formData, marketing_cost: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ship ($)</label>
                                <input type="number" step="0.01" className="w-full bg-white/10 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-white/20 transition-all outline-none" placeholder="Shipping" value={formData.shipping_cost} onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-3">
                    <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                        {initialData ? 'Update Product' : 'Publish Product'}
                        <Check className="w-6 h-6" />
                    </button>
                    <button type="button" onClick={onClose} className="w-full py-4 bg-gray-100 text-gray-500 rounded-[2rem] font-bold text-sm hover:bg-gray-200 transition-all italic">Discard Changes</button>
                </div>
            </div>
        </form>
    );

    if (isInline) {
        return (
            <div className="max-w-[1200px] mx-auto">
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-12 animate-fade-up my-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white">
                                <ShoppingBag className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{initialData ? 'Editor' : 'New Product'}</h3>
                                <p className="text-sm font-bold text-gray-400 italic">ID: {initialData ? initialData.id : 'DRAFT'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl font-light">×</button>
                    </div>
                    {Content}
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-5xl w-full p-12 animate-scale-in my-10 relative overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white">
                            <ShoppingBag className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{initialData ? 'Editor' : 'New Product'}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl font-light">×</button>
                </div>
                {Content}
            </div>
        </div>
    );
};
