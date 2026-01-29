import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { Upload, Trash2, Plus, Image as ImageIcon, X } from 'lucide-react';

interface ProductFormProps {
    initialData?: Product | null;
    onClose: () => void;
    onSubmit: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onClose, onSubmit }) => {
    // Categories structure (keeping it simple as per original, but could be dynamic)
    const [categories, setCategories] = useState<string[]>([]);

    // Need to handle subcategories dynamically if possible, but for now using the hardcoded map from dashboards
    // tailored to what's likely in the DB or just fetch distincts.
    // Actually, let's just use the same hardcoded list for categories/subcategories to ensure consistency as requested 
    // OR fetch from API if we want true "sync".
    // The user asked to "Sync Categories... Ensure Admin Panel fetches the actual... from the database".
    // So we should fetch categories.

    const [dbCategories, setDbCategories] = useState<string[]>([]);
    const [dbSubcategories, setDbSubcategories] = useState<string[]>([]);

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        price: string;
        category: string;
        subcategory: string;
        brand: string;
        imageUrl: string;
        stock: string; // Global stock (sum of variants or manual)
        gender: string;
        sizes: string; // Comma joined
        colors: string; // Comma joined
        imageFile?: File;
        additionalImages: (string | File)[];
        isFeatured: boolean;
        isPopular: boolean;
        variants: { size: string; color: string; stock: number }[];
    }>({
        name: '', description: '', price: '', category: '', subcategory: '', brand: '', imageUrl: '', stock: '',
        gender: 'Unisex', sizes: '', colors: '', additionalImages: [], isFeatured: false, isPopular: false,
        variants: []
    });

    useEffect(() => {
        // Load categories from API for "Sync" feature
        api.getCategories().then(setDbCategories);

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
                variants: initialData.variants || []
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (formData.category) {
            api.getSubcategories(formData.category).then(setDbSubcategories);
        } else {
            setDbSubcategories([]);
        }
    }, [formData.category]);

    // Variant Generation
    const generateVariants = () => {
        const sizeList = formData.sizes.split(',').map(s => s.trim()).filter(s => s);
        const colorList = formData.colors.split(',').map(c => c.trim()).filter(c => c);

        if (sizeList.length === 0 && colorList.length === 0) return;

        const newVariants: { size: string; color: string; stock: number }[] = [];

        if (sizeList.length > 0 && colorList.length > 0) {
            sizeList.forEach(size => {
                colorList.forEach(color => {
                    // Check if exists
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

        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleVariantStockChange = (idx: number, val: string) => {
        const newVariants = [...formData.variants];
        newVariants[idx].stock = parseInt(val) || 0;

        // Auto update total stock
        const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);

        setFormData(prev => ({
            ...prev,
            variants: newVariants,
            stock: totalStock.toString()
        }));
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
            stock: parseInt(formData.stock), // uses the calculated total stock
            sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
            colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
            imageFile: formData.imageFile,
            additionalImages: formData.additionalImages,
            variants: formData.variants
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

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full p-8 animate-scale-in my-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{initialData ? 'Edit Product' : 'List New Product'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 border-b pb-2">Basic Info</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-lg" placeholder="Product Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <textarea className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Description" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-2">Price ($)</label>
                                <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all font-bold" type="number" step="0.01" placeholder="0.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-2">Brand</label>
                                <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Brand" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-2">Category</label>
                                <div className="relative">
                                    <input
                                        list="categories"
                                        className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                                        placeholder="Select or Type..."
                                        required
                                    />
                                    <datalist id="categories">
                                        {dbCategories.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-2">Sub-Category</label>
                                <div className="relative">
                                    <input
                                        list="subcategories"
                                        className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        value={formData.subcategory}
                                        onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                                        placeholder="Select or Type..."
                                        disabled={!formData.category}
                                    />
                                    <datalist id="subcategories">
                                        {dbSubcategories.map(s => <option key={s} value={s} />)}
                                    </datalist>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 border-b pb-2">Images</h4>
                        <div className="flex gap-4 items-start">
                            <div className="w-32 h-32 flex-shrink-0 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 relative overflow-hidden group">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="text-gray-300 w-8 h-8" />
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                            </div>

                            {/* Additional Images (Simplified for now, similar to AdminDashboard) */}
                            <div className="flex flex-wrap gap-2">
                                {formData.additionalImages.map((img, i) => (
                                    <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
                                        <img src={img instanceof File ? URL.createObjectURL(img) : img} className="w-full h-full object-cover" />
                                        <button type="button" className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl" onClick={() => {
                                            const imgs = [...formData.additionalImages];
                                            imgs.splice(i, 1);
                                            setFormData({ ...formData, additionalImages: imgs });
                                        }}><X className="w-3 h-3" /></button>
                                    </div>
                                ))}
                                <label className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                                    <Plus className="text-gray-300" />
                                    <input type="file" multiple className="hidden" onChange={e => {
                                        if (e.target.files) setFormData({ ...formData, additionalImages: [...formData.additionalImages, ...Array.from(e.target.files)] })
                                    }} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 border-b pb-2">Variants & Inventory</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-2">Sizes (Result: {formData.sizes.split(',').filter(s => s.trim()).length} variants)</label>
                                <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all font-mono text-sm" placeholder="S, M, L" value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-2">Colors (Result: {formData.colors.split(',').filter(c => c.trim()).length} variants)</label>
                                <input className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-100 transition-all font-mono text-sm" placeholder="Red, Blue" value={formData.colors} onChange={e => setFormData({ ...formData, colors: e.target.value })} />
                            </div>
                        </div>

                        <button type="button" onClick={generateVariants} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Generate Variants
                        </button>

                        {/* Variant Table */}
                        {formData.variants.length > 0 && (
                            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Size</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Color</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Inventory Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {formData.variants.map((v, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-2 text-sm font-bold">{v.size}</td>
                                                <td className="px-4 py-2 text-sm font-bold">{v.color}</td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        className="w-24 bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm font-bold"
                                                        value={v.stock}
                                                        onChange={(e) => handleVariantStockChange(i, e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-2">Total Stock</label>
                            <input className="w-full bg-gray-100 border-none rounded-xl p-3.5 font-bold text-gray-600 cursor-not-allowed" readOnly value={formData.stock} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
