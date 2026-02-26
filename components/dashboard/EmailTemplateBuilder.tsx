import React, { useState } from 'react';
import {
    Layout, Type, Image as ImageIcon, Palette,
    Move, Trash2, Copy, Eye, Save, Mail, Link,
    ShoppingBag, Star, Gift, ArrowRight, Monitor, Smartphone,
    Square
} from 'lucide-react';

export interface EmailBlock {
    id: string;
    type: 'header' | 'text' | 'image' | 'button' | 'product' | 'divider' | 'footer';
    content: any;
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    previewText: string;
    blocks: EmailBlock[];
}

const TEMPLATES: EmailTemplate[] = [
    {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to SmartShop! 🎉',
        previewText: 'We\'re excited to have you on board',
        blocks: [
            { id: '1', type: 'header', content: { text: 'Welcome!', backgroundColor: '#4F46E5' } },
            { id: '2', type: 'text', content: { text: 'Hi {{customer_name}},\n\nThank you for joining SmartShop! We\'re thrilled to have you as part of our community.', alignment: 'left' } },
            { id: '3', type: 'button', content: { text: 'Start Shopping', url: '/products', backgroundColor: '#4F46E5' } },
        ]
    },
    {
        id: 'promo',
        name: 'Promotional Sale',
        subject: 'Flash Sale - 50% Off! 🔥',
        previewText: 'Don\'t miss out on these amazing deals',
        blocks: [
            { id: '1', type: 'header', content: { text: 'FLASH SALE', backgroundColor: '#EF4444' } },
            { id: '2', type: 'image', content: { url: '', alt: 'Sale Banner' } },
            { id: '3', type: 'text', content: { text: 'Get up to 50% off on selected items. Use code: FLASH50', alignment: 'center' } },
            { id: '4', type: 'button', content: { text: 'Shop Now', url: '/products?sale=true', backgroundColor: '#EF4444' } },
        ]
    },
    {
        id: 'abandoned-cart',
        name: 'Abandoned Cart',
        subject: 'You left something in your cart 🛒',
        previewText: 'Complete your purchase before it\'s gone',
        blocks: [
            { id: '1', type: 'header', content: { text: 'Forgot Something?', backgroundColor: '#F59E0B' } },
            { id: '2', type: 'product', content: { productId: null } },
            { id: '3', type: 'text', content: { text: 'Your items are waiting! Complete your checkout now.', alignment: 'center' } },
            { id: '4', type: 'button', content: { text: 'Complete Purchase', url: '/cart', backgroundColor: '#F59E0B' } },
        ]
    },
    {
        id: 'thank-you',
        name: 'Thank You / Order Confirmation',
        subject: 'Thank you for your order! ❤️',
        previewText: 'Your order has been confirmed',
        blocks: [
            { id: '1', type: 'header', content: { text: 'Thank You!', backgroundColor: '#10B981' } },
            { id: '2', type: 'text', content: { text: 'Hi {{customer_name}},\n\nYour order #{{order_id}} has been confirmed and will be shipped soon.', alignment: 'left' } },
            { id: '3', type: 'button', content: { text: 'Track Order', url: '/orders', backgroundColor: '#10B981' } },
        ]
    },
    {
        id: 're-engagement',
        name: 'Re-engagement',
        subject: 'We miss you! Come back 🎁',
        previewText: 'Here\'s a special gift just for you',
        blocks: [
            { id: '1', type: 'header', content: { text: 'We Miss You!', backgroundColor: '#8B5CF6' } },
            { id: '2', type: 'text', content: { text: 'It\'s been a while! Here\'s 20% off your next order. Use code: COMEBACK20', alignment: 'center' } },
            { id: '3', type: 'button', content: { text: 'Claim Offer', url: '/products', backgroundColor: '#8B5CF6' } },
        ]
    },
];

const BLOCK_ICONS: Record<string, any> = {
    header: Layout,
    text: Type,
    image: ImageIcon,
    button: Square,
    product: ShoppingBag,
    divider: Move,
    footer: Mail,
};

const BLOCK_LABELS: Record<string, string> = {
    header: 'Header',
    text: 'Text Block',
    image: 'Image',
    button: 'Button',
    product: 'Product',
    divider: 'Divider',
    footer: 'Footer',
};

interface EmailTemplateBuilderProps {
    onTemplateSelect?: (template: EmailTemplate) => void;
    initialTemplate?: EmailTemplate | null;
}

export const EmailTemplateBuilder: React.FC<EmailTemplateBuilderProps> = ({ 
    onTemplateSelect,
    initialTemplate 
}) => {
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(initialTemplate || null);
    const [blocks, setBlocks] = useState<EmailBlock[]>(initialTemplate?.blocks || []);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
    const [showTemplates, setShowTemplates] = useState(true);

    const addBlock = (type: EmailBlock['type']) => {
        const newBlock: EmailBlock = {
            id: `block-${Date.now()}`,
            type,
            content: getDefaultContent(type),
        };
        setBlocks([...blocks, newBlock]);
        setSelectedTemplate(null);
    };

    const getDefaultContent = (type: string) => {
        switch (type) {
            case 'header':
                return { text: 'Your Header', backgroundColor: '#4F46E5', textColor: '#FFFFFF' };
            case 'text':
                return { text: 'Add your message here...', alignment: 'left', fontSize: 16 };
            case 'image':
                return { url: '', alt: 'Image', width: '100%' };
            case 'button':
                return { text: 'Click Here', url: '#', backgroundColor: '#4F46E5', textColor: '#FFFFFF' };
            case 'product':
                return { productId: null, showPrice: true, showButton: true };
            case 'divider':
                return { color: '#E5E7EB', thickness: 1 };
            case 'footer':
                return { text: '© 2024 SmartShop. All rights reserved.', backgroundColor: '#1F2937', textColor: '#9CA3AF' };
            default:
                return {};
        }
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const duplicateBlock = (id: string) => {
        const index = blocks.findIndex(b => b.id === id);
        if (index !== -1) {
            const newBlock = { ...blocks[index], id: `block-${Date.now()}` };
            const newBlocks = [...blocks];
            newBlocks.splice(index + 1, 0, newBlock);
            setBlocks(newBlocks);
        }
    };

    const moveBlock = (id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const updateBlockContent = (id: string, content: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
    };

    const renderBlockPreview = (block: EmailBlock) => {
        switch (block.type) {
            case 'header':
                return (
                    <div 
                        className="w-full py-8 px-6 text-center"
                        style={{ backgroundColor: block.content.backgroundColor, color: block.content.textColor }}
                    >
                        <h2 className="text-2xl font-bold">{block.content.text}</h2>
                    </div>
                );
            case 'text':
                return (
                    <div 
                        className="w-full py-4 px-6"
                        style={{ textAlign: block.content.alignment }}
                    >
                        <p className="text-gray-700 whitespace-pre-line" style={{ fontSize: block.content.fontSize }}>
                            {block.content.text}
                        </p>
                    </div>
                );
            case 'image':
                return (
                    <div className="w-full py-4 px-6">
                        {block.content.url ? (
                            <img src={block.content.url} alt={block.content.alt} className="w-full rounded-lg" />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-400" />
                            </div>
                        )}
                    </div>
                );
            case 'button':
                return (
                    <div className="w-full py-4 px-6 text-center">
                        <a
                            href={block.content.url}
                            className="inline-block px-8 py-3 rounded-lg font-bold text-white"
                            style={{ backgroundColor: block.content.backgroundColor, color: block.content.textColor }}
                        >
                            {block.content.text}
                        </a>
                    </div>
                );
            case 'product':
                return (
                    <div className="w-full py-4 px-6">
                        <div className="border border-gray-200 rounded-xl p-4 max-w-sm mx-auto">
                            <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                <ShoppingBag className="w-16 h-16 text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-900">Product Name</h3>
                            <p className="text-indigo-600 font-bold mt-1">$99.00</p>
                            {block.content.showButton && (
                                <button className="w-full mt-3 bg-indigo-600 text-white py-2 rounded-lg font-bold">
                                    Shop Now
                                </button>
                            )}
                        </div>
                    </div>
                );
            case 'divider':
                return (
                    <div className="w-full py-4 px-6">
                        <hr style={{ borderColor: block.content.color, borderWidth: block.content.thickness }} />
                    </div>
                );
            case 'footer':
                return (
                    <div 
                        className="w-full py-6 px-6 text-center"
                        style={{ backgroundColor: block.content.backgroundColor, color: block.content.textColor }}
                    >
                        <p className="text-sm">{block.content.text}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-200px)]">
            {/* Left Sidebar - Templates & Blocks */}
            <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto">
                {/* Template Gallery */}
                {showTemplates && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                                Templates
                            </h3>
                            <button 
                                onClick={() => setShowTemplates(false)}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold"
                            >
                                Start Blank
                            </button>
                        </div>
                        <div className="space-y-2">
                            {TEMPLATES.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => {
                                        setSelectedTemplate(template);
                                        setBlocks(template.blocks);
                                        setShowTemplates(false);
                                        onTemplateSelect?.(template);
                                    }}
                                    className="w-full p-3 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{template.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{template.subject}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Blocks */}
                {!showTemplates && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                                Add Blocks
                            </h3>
                            <button 
                                onClick={() => setShowTemplates(true)}
                                className="text-xs text-gray-500 hover:text-gray-700 font-bold"
                            >
                                ← Templates
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(BLOCK_LABELS).map(([type, label]) => {
                                const Icon = BLOCK_ICONS[type];
                                return (
                                    <button
                                        key={type}
                                        onClick={() => addBlock(type as EmailBlock['type'])}
                                        className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center gap-2"
                                    >
                                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Block List */}
                {!showTemplates && blocks.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                            Blocks ({blocks.length})
                        </h3>
                        <div className="space-y-2">
                            {blocks.map((block, index) => {
                                const Icon = BLOCK_ICONS[block.type];
                                return (
                                    <div
                                        key={block.id}
                                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                            selectedBlock === block.id 
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                        onClick={() => setSelectedBlock(block.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-gray-500" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    {BLOCK_LABELS[block.type]}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                                    disabled={index === 0}
                                                >
                                                    <ArrowRight className="w-3 h-3 text-gray-500 rotate-[-90deg]" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                                    disabled={index === blocks.length - 1}
                                                >
                                                    <ArrowRight className="w-3 h-3 text-gray-500 rotate-[90deg]" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                                >
                                                    <Copy className="w-3 h-3 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Center - Email Preview */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                            <button
                                onClick={() => setPreviewMode('desktop')}
                                className={`p-2 rounded-lg transition-all ${
                                    previewMode === 'desktop' 
                                        ? 'bg-white dark:bg-gray-700 shadow-sm' 
                                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                                onClick={() => setPreviewMode('mobile')}
                                className={`p-2 rounded-lg transition-all ${
                                    previewMode === 'mobile' 
                                        ? 'bg-white dark:bg-gray-700 shadow-sm' 
                                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Smartphone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                {blocks.length} block{blocks.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Test Send</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-500/20">
                            <Save className="w-4 h-4" />
                            <span className="text-sm font-bold">Save Template</span>
                        </button>
                    </div>
                </div>

                {/* Email Canvas */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 overflow-y-auto">
                    <div 
                        className={`mx-auto bg-white shadow-xl transition-all ${
                            previewMode === 'desktop' 
                                ? 'w-full max-w-[600px]' 
                                : 'w-[375px]'
                        }`}
                    >
                        {blocks.length === 0 ? (
                            <div className="p-12 text-center">
                                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">
                                    Select a template or start building from scratch
                                </p>
                            </div>
                        ) : (
                            blocks.map(block => renderBlockPreview(block))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Block Properties */}
            {selectedBlock && (
                <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                        Block Properties
                    </h3>
                    {(() => {
                        const block = blocks.find(b => b.id === selectedBlock);
                        if (!block) return null;

                        return (
                            <div className="space-y-4">
                                {block.type === 'header' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Text</label>
                                            <input
                                                type="text"
                                                value={block.content.text}
                                                onChange={(e) => updateBlockContent(block.id, { ...block.content, text: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Background Color</label>
                                            <input
                                                type="color"
                                                value={block.content.backgroundColor}
                                                onChange={(e) => updateBlockContent(block.id, { ...block.content, backgroundColor: e.target.value })}
                                                className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                    </>
                                )}

                                {block.type === 'text' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Content</label>
                                            <textarea
                                                value={block.content.text}
                                                onChange={(e) => updateBlockContent(block.id, { ...block.content, text: e.target.value })}
                                                rows={6}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Alignment</label>
                                            <div className="flex gap-2">
                                                {['left', 'center', 'right'].map(align => (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateBlockContent(block.id, { ...block.content, alignment: align })}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                            block.content.alignment === align
                                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        {align.charAt(0).toUpperCase() + align.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {block.type === 'button' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Button Text</label>
                                            <input
                                                type="text"
                                                value={block.content.text}
                                                onChange={(e) => updateBlockContent(block.id, { ...block.content, text: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">URL</label>
                                            <input
                                                type="url"
                                                value={block.content.url}
                                                onChange={(e) => updateBlockContent(block.id, { ...block.content, url: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Background Color</label>
                                            <input
                                                type="color"
                                                value={block.content.backgroundColor}
                                                onChange={(e) => updateBlockContent(block.id, { ...block.content, backgroundColor: e.target.value })}
                                                className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                    </>
                                )}

                                {block.type === 'image' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
                                            <input
                                                type="url"
                                                value={block.content.url}
                                                onChange={(e) => updateBlockContent(block.id, { ...block.content, url: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Alt Text</label>
                                            <input
                                                type="text"
                                                value={block.content.alt}
                                                onChange={(e) => updateBlockContent(block.id, { ...block.content, alt: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};
