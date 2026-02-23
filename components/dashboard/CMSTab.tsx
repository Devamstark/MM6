import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
    Plus, Edit2, Trash2, Image as ImageIcon, Move, Save, X,
    Palette, Link as LinkIcon, Type, Layout, Eye, EyeOff, Upload
} from 'lucide-react';

interface HeroBanner {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    background_color: string;
    cta_text: string;
    cta_link: string;
    is_active: boolean;
    image_fit?: string;
    image_position?: string;
    content_scale?: number;
}

interface HomeSection {
    id: string;
    title: string;
    section_type: string;
    description: string;
    image: string;
    link: string;
    is_active: boolean;
    display_order: number;
}

export const CMSTab = () => {
    const [activeSubTab, setActiveSubTab] = useState<'hero' | 'sections'>('hero');
    const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
    const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [isHeroFormOpen, setIsHeroFormOpen] = useState(false);
    const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
    const [editingHero, setEditingHero] = useState<HeroBanner | null>(null);
    const [editingSection, setEditingSection] = useState<HomeSection | null>(null);

    const [heroFormData, setHeroFormData] = useState<Partial<HeroBanner>>({
        title: '',
        subtitle: '',
        description: '',
        image: '',
        background_color: '#f6f6f6',
        cta_text: '',
        cta_link: '',
        is_active: true,
        display_order: 0,
        image_fit: 'cover',
        image_position: 'center',
        content_scale: 100
    });

    const [isDragging, setIsDragging] = useState(false);
    const [previewPosition, setPreviewPosition] = useState({ x: 50, y: 50 });
    const previewRef = useRef<HTMLDivElement>(null);

    const [sectionFormData, setSectionFormData] = useState<Partial<HomeSection>>({
        title: '',
        section_type: 'featured_collection',
        description: '',
        image: '',
        link: '',
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [banners, sections] = await Promise.all([
                api.getHeroBanners(),
                api.getHomeSections()
            ]);
            setHeroBanners(banners);
            setHomeSections(sections);
        } catch (e) {
            console.error('Failed to load CMS data', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHero = async () => {
        try {
            if (editingHero) {
                await api.updateHeroBanner(editingHero.id, heroFormData);
            } else {
                await api.createHeroBanner(heroFormData);
            }
            setIsHeroFormOpen(false);
            setEditingHero(null);
            setHeroFormData({
                title: '',
                subtitle: '',
                description: '',
                image: '',
                background_color: '#f6f6f6',
                cta_text: '',
                cta_link: '',
                is_active: true,
                display_order: 0,
                image_fit: 'cover',
                image_position: 'center',
                content_scale: 100
            });
            loadData();
        } catch (e) {
            alert('Failed to save banner');
            console.error(e);
        }
    };

    const handleSaveSection = async () => {
        try {
            if (editingSection) {
                await api.updateHomeSection(editingSection.id, sectionFormData);
            } else {
                await api.createHomeSection(sectionFormData);
            }
            setIsSectionFormOpen(false);
            setEditingSection(null);
            setSectionFormData({
                title: '',
                section_type: 'featured_collection',
                description: '',
                image: '',
                link: '',
                is_active: true,
                display_order: 0
            });
            loadData();
        } catch (e) {
            alert('Failed to save section');
            console.error(e);
        }
    };

    const handleDeleteHero = async (id: string) => {
        if (window.confirm('Delete this banner?')) {
            await api.deleteHeroBanner(id);
            loadData();
        }
    };

    const handleDeleteSection = async (id: string) => {
        if (window.confirm('Delete this section?')) {
            await api.deleteHomeSection(id);
            loadData();
        }
    };

    const handleEditHero = (banner: HeroBanner) => {
        setEditingHero(banner);
        setHeroFormData(banner);
        // Sync preview position
        const pos = banner.image_position || 'center';
        const xMap: Record<string, number> = { left: 0, center: 50, right: 100 };
        const yMap: Record<string, number> = { top: 0, center: 50, bottom: 100 };
        const parts = pos.split(' ');
        const yPos = yMap[parts[0]] ?? 50;
        const xPos = parts[1] ? xMap[parts[1]] : 50;
        setPreviewPosition({ x: xPos, y: yPos });
        setIsHeroFormOpen(true);
    };

    const handleEditSection = (section: HomeSection) => {
        setEditingSection(section);
        setSectionFormData(section);
        setIsSectionFormOpen(true);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'hero' | 'section') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (field === 'hero') {
                    setHeroFormData({ ...heroFormData, image: reader.result as string });
                } else {
                    setSectionFormData({ ...sectionFormData, image: reader.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePositionClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!previewRef.current) return;
        const rect = previewRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPreviewPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });

        // Convert to position string
        const xPos = x < 33 ? 'left' : x > 66 ? 'right' : 'center';
        const yPos = y < 33 ? 'top' : y > 66 ? 'bottom' : 'center';
        const position = `${yPos}${xPos !== 'center' ? ' ' + xPos : ''}`.trim() || 'center';
        setHeroFormData({ ...heroFormData, image_position: position });
    };

    const handlePositionMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !previewRef.current) return;
        const rect = previewRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPreviewPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });

        // Convert to position string
        const xPos = x < 33 ? 'left' : x > 66 ? 'right' : 'center';
        const yPos = y < 33 ? 'top' : y > 66 ? 'bottom' : 'center';
        const position = `${yPos}${xPos !== 'center' ? ' ' + xPos : ''}`.trim() || 'center';
        setHeroFormData({ ...heroFormData, image_position: position });
    };

    const sectionTypes = [
        { value: 'featured_collection', label: 'Featured Collection' },
        { value: 'promotional_banner', label: 'Promotional Banner' },
        { value: 'category_showcase', label: 'Category Showcase' },
        { value: 'testimonial', label: 'Testimonial' },
        { value: 'brand_logo', label: 'Brand Logo' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500">Loading CMS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveSubTab('hero')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeSubTab === 'hero'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Hero Banners
                </button>
                <button
                    onClick={() => setActiveSubTab('sections')}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeSubTab === 'sections'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Home Sections
                </button>
            </div>

            {/* Hero Banners Tab */}
            {activeSubTab === 'hero' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Hero Banners</h3>
                            <p className="text-sm text-gray-500">Manage homepage hero section banners</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingHero(null);
                                setHeroFormData({
                                    title: '',
                                    subtitle: '',
                                    description: '',
                                    image: '',
                                    background_color: '#f6f6f6',
                                    cta_text: '',
                                    cta_link: '',
                                    is_active: true,
                                    display_order: heroBanners.length,
                                    content_scale: 100
                                });
                                setIsHeroFormOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm"
                        >
                            <Plus className="w-4 h-4" /> Add Banner
                        </button>
                    </div>

                    {isHeroFormOpen && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-900">
                                    {editingHero ? 'Edit Banner' : 'Add New Banner'}
                                </h4>
                                <button
                                    onClick={() => {
                                        setIsHeroFormOpen(false);
                                        setEditingHero(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={heroFormData.title}
                                        onChange={(e) => setHeroFormData({ ...heroFormData, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                        placeholder="Summer Sale"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                    <input
                                        type="text"
                                        value={heroFormData.subtitle}
                                        onChange={(e) => setHeroFormData({ ...heroFormData, subtitle: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                        placeholder="Up to 70% Off"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={heroFormData.description}
                                        onChange={(e) => setHeroFormData({ ...heroFormData, description: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                        rows={2}
                                        placeholder="Discover the hottest trends..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={heroFormData.background_color}
                                            onChange={(e) => setHeroFormData({ ...heroFormData, background_color: e.target.value })}
                                            className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={heroFormData.background_color}
                                            onChange={(e) => setHeroFormData({ ...heroFormData, background_color: e.target.value })}
                                            className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm"
                                            placeholder="#f6f6f6"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={heroFormData.display_order}
                                        onChange={(e) => setHeroFormData({ ...heroFormData, display_order: parseInt(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                                    <input
                                        type="text"
                                        value={heroFormData.cta_text}
                                        onChange={(e) => setHeroFormData({ ...heroFormData, cta_text: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                        placeholder="Shop Now"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                                    <input
                                        type="text"
                                        value={heroFormData.cta_link}
                                        onChange={(e) => setHeroFormData({ ...heroFormData, cta_link: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                        placeholder="/products?category=summer"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm font-medium">Upload Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'hero')}
                                                className="hidden"
                                            />
                                        </label>
                                        {heroFormData.image && (
                                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={heroFormData.image} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Fit</label>
                                    <select
                                        value={heroFormData.image_fit}
                                        onChange={(e) => setHeroFormData({ ...heroFormData, image_fit: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                    >
                                        <option value="cover">Cover (Fill - May Crop)</option>
                                        <option value="contain">Contain (Fit - No Crop)</option>
                                        <option value="fill">Fill (Stretch)</option>
                                        <option value="none">None (Original Size)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {heroFormData.image_fit === 'cover' && 'Fills entire area, may crop edges'}
                                        {heroFormData.image_fit === 'contain' && 'Shows full image, may have empty space'}
                                        {heroFormData.image_fit === 'fill' && 'Stretches image, may distort'}
                                        {heroFormData.image_fit === 'none' && 'Shows at original size'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Position</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Dropdown for quick selection */}
                                        <div>
                                            <select
                                                value={heroFormData.image_position}
                                                onChange={(e) => {
                                                    setHeroFormData({ ...heroFormData, image_position: e.target.value });
                                                    // Update preview position based on selection
                                                    const pos = e.target.value;
                                                    const xMap: Record<string, number> = { left: 0, center: 50, right: 100 };
                                                    const yMap: Record<string, number> = { top: 0, center: 50, bottom: 100 };
                                                    const parts = pos.split(' ');
                                                    const yPos = yMap[parts[0]] ?? 50;
                                                    const xPos = parts[1] ? xMap[parts[1]] : 50;
                                                    setPreviewPosition({ x: xPos, y: yPos });
                                                }}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                            >
                                                <option value="center">Center</option>
                                                <option value="top">Top</option>
                                                <option value="bottom">Bottom</option>
                                                <option value="left">Left</option>
                                                <option value="right">Right</option>
                                                <option value="top left">Top Left</option>
                                                <option value="top right">Top Right</option>
                                                <option value="bottom left">Bottom Left</option>
                                                <option value="bottom right">Bottom Right</option>
                                            </select>
                                        </div>
                                        {/* Interactive Position Picker */}
                                        <div>
                                            <div
                                                ref={previewRef}
                                                onClick={handlePositionClick}
                                                onMouseDown={() => setIsDragging(true)}
                                                onMouseUp={() => setIsDragging(false)}
                                                onMouseLeave={() => setIsDragging(false)}
                                                onMouseMove={handlePositionMove}
                                                className="relative w-full aspect-video bg-gray-100 rounded-lg border-2 border-gray-300 cursor-crosshair overflow-hidden hover:border-indigo-500 transition-colors"
                                            >
                                                {heroFormData.image ? (
                                                    <>
                                                        <img
                                                            src={heroFormData.image}
                                                            alt="Position preview"
                                                            className="absolute inset-0 w-full h-full opacity-50"
                                                            style={{
                                                                objectFit: 'cover',
                                                                objectPosition: `${previewPosition.y}% ${previewPosition.x}%`
                                                            }}
                                                        />
                                                        <div
                                                            className="absolute w-4 h-4 border-2 border-red-500 bg-red-500/30 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                                            style={{
                                                                left: `${previewPosition.x}%`,
                                                                top: `${previewPosition.y}%`
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                        <div className="text-center">
                                                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                                            <p className="text-xs">Upload image first</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Click or drag to set focal point
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                                <Type className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900">Content Scale</label>
                                                <p className="text-xs text-gray-500">Adjust title and button sizes ({heroFormData.content_scale ?? 100}%)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                                <button
                                                    onClick={() => setHeroFormData({ ...heroFormData, content_scale: Math.max(50, (heroFormData.content_scale || 100) - 5) })}
                                                    className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                                                >
                                                    -
                                                </button>
                                                <div className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center font-black text-indigo-600">
                                                    {heroFormData.content_scale ?? 100}%
                                                </div>
                                                <button
                                                    onClick={() => setHeroFormData({ ...heroFormData, content_scale: Math.min(200, (heroFormData.content_scale || 100) + 5) })}
                                                    className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setHeroFormData({ ...heroFormData, content_scale: 85 })}
                                                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-tighter bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                                >
                                                    Small
                                                </button>
                                                <button
                                                    onClick={() => setHeroFormData({ ...heroFormData, content_scale: 100 })}
                                                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-tighter bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                                >
                                                    Normal
                                                </button>
                                                <button
                                                    onClick={() => setHeroFormData({ ...heroFormData, content_scale: 125 })}
                                                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-tighter bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                                >
                                                    Large
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={heroFormData.is_active}
                                            onChange={(e) => setHeroFormData({ ...heroFormData, is_active: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active (Show on homepage)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveHero}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm"
                                >
                                    <Save className="w-4 h-4" /> Save Banner
                                </button>
                                <button
                                    onClick={() => {
                                        setIsHeroFormOpen(false);
                                        setEditingHero(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Banners List */}
                    <div className="grid gap-4">
                        {heroBanners.map((banner) => (
                            <div key={banner.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                                {banner.image ? (
                                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-900 truncate">{banner.title}</h4>
                                        {banner.is_active ? (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">Active</span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">Inactive</span>
                                        )}
                                    </div>
                                    {banner.subtitle && <p className="text-sm text-gray-500">{banner.subtitle}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditHero(banner)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteHero(banner.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {heroBanners.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No hero banners yet</p>
                                <p className="text-sm text-gray-400">Add your first banner to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Home Sections Tab */}
            {activeSubTab === 'sections' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Home Sections</h3>
                            <p className="text-sm text-gray-500">Manage homepage content sections</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingSection(null);
                                setSectionFormData({
                                    title: '',
                                    section_type: 'featured_collection',
                                    description: '',
                                    image: '',
                                    link: '',
                                    is_active: true,
                                    display_order: homeSections.length
                                });
                                setIsSectionFormOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm"
                        >
                            <Plus className="w-4 h-4" /> Add Section
                        </button>
                    </div>

                    {isSectionFormOpen && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-900">
                                    {editingSection ? 'Edit Section' : 'Add New Section'}
                                </h4>
                                <button
                                    onClick={() => {
                                        setIsSectionFormOpen(false);
                                        setEditingSection(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={sectionFormData.title}
                                        onChange={(e) => setSectionFormData({ ...sectionFormData, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                        placeholder="Featured Products"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Type *</label>
                                    <select
                                        value={sectionFormData.section_type}
                                        onChange={(e) => setSectionFormData({ ...sectionFormData, section_type: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                    >
                                        {sectionTypes.map((type) => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={sectionFormData.description}
                                        onChange={(e) => setSectionFormData({ ...sectionFormData, description: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                        rows={2}
                                        placeholder="Check out our latest collection..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                                    <input
                                        type="text"
                                        value={sectionFormData.link}
                                        onChange={(e) => setSectionFormData({ ...sectionFormData, link: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                        placeholder="/products/featured"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={sectionFormData.display_order}
                                        onChange={(e) => setSectionFormData({ ...sectionFormData, display_order: parseInt(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Image</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm font-medium">Upload Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'section')}
                                                className="hidden"
                                            />
                                        </label>
                                        {sectionFormData.image && (
                                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={sectionFormData.image} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={sectionFormData.is_active}
                                            onChange={(e) => setSectionFormData({ ...sectionFormData, is_active: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active (Show on homepage)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveSection}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm"
                                >
                                    <Save className="w-4 h-4" /> Save Section
                                </button>
                                <button
                                    onClick={() => {
                                        setIsSectionFormOpen(false);
                                        setEditingSection(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Sections List */}
                    <div className="grid gap-4">
                        {homeSections.map((section) => (
                            <div key={section.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                                {section.image ? (
                                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                        <img src={section.image} alt={section.title} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                        <Layout className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-900 truncate">{section.title}</h4>
                                        {section.is_active ? (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">Active</span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">Inactive</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 capitalize">{section.section_type.replace('_', ' ')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditSection(section)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {homeSections.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <Layout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No sections yet</p>
                                <p className="text-sm text-gray-400">Add your first section to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
