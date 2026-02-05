import React, { useState, useRef } from 'react';
import { X, Upload, Plus, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';

interface BatchDraft {
    id: string;
    file: File;
    previewUrl: string;
    name: string;
    price: string;
    category: string;
    subcategory: string;
    brand: string;
}

interface BatchProductCreatorProps {
    onClose: () => void;
    onSuccess: () => void;
    existingCategories?: string[]; // strings of "Category" or "Category > Subcategory" ideally, but let's stick to simple for now
}

const SUBCATEGORIES: Record<string, string[]> = {
    'Men': ['T-Shirts', 'Shirts', 'Pants', 'Jeans', 'Jackets', 'Suits', 'Activewear', 'Shoes'],
    'Women': ['Dresses', 'Tops', 'Blouses', 'Skirts', 'Pants', 'Jeans', 'Jackets', 'Activewear', 'Shoes', 'Handbags'],
    'Accessories': ['Watches', 'Wallets', 'Bags', 'Belts', 'Hats', 'Sunglasses', 'Jewelry']
};

export const BatchProductCreator: React.FC<BatchProductCreatorProps> = ({ onClose, onSuccess, existingCategories = [] }) => {
    const [drafts, setDrafts] = useState<BatchDraft[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newDrafts: BatchDraft[] = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                file,
                previewUrl: URL.createObjectURL(file), // Create local preview
                name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "), // Remove extension and cleanup
                price: '',
                category: 'Men',
                subcategory: '',
                brand: 'Generic'
            }));
            setDrafts(prev => [...prev, ...newDrafts]);
        }
    };

    const updateDraft = (id: string, field: keyof BatchDraft, value: string) => {
        setDrafts(current =>
            current.map(d => d.id === id ? { ...d, [field]: value } : d)
        );
    };

    const removeDraft = (id: string) => {
        setDrafts(current => current.filter(d => d.id !== id));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        let successCount = 0;

        // Process one by one or in small batches to avoid overwhelming the server
        for (const draft of drafts) {
            if (!draft.name || !draft.price) continue;

            try {
                const formData = new FormData();
                formData.append('name', draft.name);
                formData.append('price', draft.price);
                formData.append('description', 'Quickly added via Batch Creator');
                formData.append('category', draft.category);

                if (draft.subcategory) {
                    formData.append('subcategory', draft.subcategory);
                }

                formData.append('brand', draft.brand || 'Generic');
                formData.append('stock_quantity', '1');

                // Infer gender
                const gender = draft.category === 'Men' ? 'Male' : draft.category === 'Women' ? 'Female' : 'Unisex';
                formData.append('gender', gender);

                formData.append('is_featured', 'false');
                formData.append('is_popular', 'false');
                formData.append('cogs', '0');
                formData.append('marketing_cost', '0');
                formData.append('shipping_cost', '0');

                formData.append('image', draft.file);

                // We use the direct API client logic here or existing createProduct if it supported FormData properly with separate args
                await api.client.post('/products/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                successCount++;
            } catch (e: any) {
                console.error(`Failed to create ${draft.name}`, e);
                if (e.response) {
                    if (e.response.data) {
                        console.error('Validation errors:', e.response.data);
                        alert(`Failed to create ${draft.name}: ${JSON.stringify(e.response.data)}`);
                    } else {
                        console.error('Server Error:', e.response.status, e.response.statusText);
                        alert(`Failed to create ${draft.name}: Server Error ${e.response.status} ${e.response.statusText}`);
                    }
                } else {
                    console.error('Unknown Error:', e);
                    alert(`Failed to create ${draft.name}: Unknown Error`);
                }
            }
        }

        setIsSubmitting(false);
        if (successCount > 0) {
            alert(`Successfully created ${successCount} products!`);
            onSuccess();
            onClose();
        } else {
            alert("Failed to create products. Please check inputs.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-hidden">
            <div className="bg-white w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-up">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Batch Product Creator</h2>
                        <p className="text-gray-500 text-sm">Upload multiple images and quickly convert them into products.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-red-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">

                    {drafts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl bg-white p-12 text-center">
                            <div className="bg-indigo-50 p-4 rounded-full mb-4">
                                <Upload className="w-12 h-12 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Drop images here or click to upload</h3>
                            <p className="text-gray-500 mb-6 max-w-sm">Select multiple product images to instantly generate draft products you can edit.</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1"
                            >
                                Select Images
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Add More Card */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-2xl bg-white/50 flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all group"
                            >
                                <Plus className="w-12 h-12 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                <span className="mt-2 text-gray-500 font-medium group-hover:text-indigo-600">Add More</span>
                            </div>

                            {drafts.map((draft) => (
                                <div key={draft.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group hover:shadow-md transition-all">
                                    <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
                                        <img src={draft.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeDraft(draft.id)}
                                            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Product Name</label>
                                            <input
                                                type="text"
                                                value={draft.name}
                                                onChange={(e) => updateDraft(draft.id, 'name', e.target.value)}
                                                className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 transition-all"
                                                placeholder="Product Name"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Brand</label>
                                            <input
                                                type="text"
                                                value={draft.brand}
                                                onChange={(e) => updateDraft(draft.id, 'brand', e.target.value)}
                                                className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition-all"
                                                placeholder="Brand Name"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Price ($)</label>
                                                <input
                                                    type="number"
                                                    value={draft.price}
                                                    onChange={(e) => updateDraft(draft.id, 'price', e.target.value)}
                                                    className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition-all"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Category</label>
                                                <select
                                                    value={draft.category}
                                                    onChange={(e) => updateDraft(draft.id, 'category', e.target.value)}
                                                    className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-gray-600 transition-all appearance-none"
                                                >
                                                    <option value="Men">Men</option>
                                                    <option value="Women">Women</option>
                                                    <option value="Accessories">Accessories</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Sub Category</label>
                                                <select
                                                    value={draft.subcategory}
                                                    onChange={(e) => updateDraft(draft.id, 'subcategory', e.target.value)}
                                                    className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-gray-600 transition-all appearance-none"
                                                >
                                                    <option value="">Select...</option>
                                                    {(SUBCATEGORIES[draft.category] || []).map(sub => (
                                                        <option key={sub} value={sub}>{sub}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <datalist id="categories-list">
                        {existingCategories.map(c => <option key={c} value={c} />)}
                        <option value="Clothing" />
                        <option value="Electronics" />
                        <option value="Accessories" />
                        <option value="Home" />
                    </datalist>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFiles}
                        multiple
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                {/* Footer */}
                {drafts.length > 0 && (
                    <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                            {drafts.filter(d => d.name && d.price).length} of {drafts.length} ready to create
                        </span>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-black hover:bg-gray-900 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Create All Products
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Start of Trash2 icon component since it was missing in imports
function Trash2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
    );
}
