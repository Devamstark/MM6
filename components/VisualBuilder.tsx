import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Save, Plus, Image as ImageIcon, Type, ShoppingBag, GripVertical, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Types for our blocks
export type BlockType = 'hero' | 'text' | 'product-grid';

export interface Block {
    id: string;
    type: BlockType;
    data: any;
}

interface VisualBuilderProps {
    initialTitle: string;
    initialContent: string; // This might be HTML or JSON
    slug: string;
    categories: string[]; // For product grid selection
    onSave: (slug: string, title: string, content: string) => Promise<void>;
    onClose: () => void;
}

// --- Block Editors ---

const HeroEditor = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => (
    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Heading</label>
            <input
                value={data.title || ''}
                onChange={e => onChange({ ...data, title: e.target.value })}
                className="w-full p-2 rounded border border-gray-300"
                placeholder="Big Headline"
            />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Subtitle</label>
            <input
                value={data.subtitle || ''}
                onChange={e => onChange({ ...data, subtitle: e.target.value })}
                className="w-full p-2 rounded border border-gray-300"
                placeholder="Catchy description"
            />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Background Image URL</label>
            <input
                value={data.image || ''}
                onChange={e => onChange({ ...data, image: e.target.value })}
                className="w-full p-2 rounded border border-gray-300"
                placeholder="https://..."
            />
        </div>
    </div>
);

const TextEditor = ({ data, onChange }: { data: any, onChange: (d: any) => void }) => (
    <div className="bg-white">
        <ReactQuill
            theme="snow"
            value={data.content || ''}
            onChange={content => onChange({ ...data, content })}
            className="h-64 mb-12"
        />
    </div>
);

const ProductGridEditor = ({ data, onChange, categories }: { data: any, onChange: (d: any) => void, categories: string[] }) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category to Display</label>
        <select
            value={data.category || ''}
            onChange={e => onChange({ ...data, category: e.target.value })}
            className="w-full p-2 rounded border border-gray-300 bg-white"
        >
            <option value="">All Products</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
    </div>
);

// --- Sortable Block Wrapper ---

const SortableBlock = ({
    block,
    onDelete,
    onChange,
    categories
}: {
    block: Block,
    onDelete: (id: string) => void,
    onChange: (id: string, data: any) => void,
    categories: string[]
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group mb-4">
            <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-move text-gray-300 hover:text-gray-600 bg-white border-l border-t border-b border-gray-200 rounded-l-xl z-10" {...attributes} {...listeners}>
                <GripVertical className="w-4 h-4" />
            </div>

            <div className="ml-8 bg-white border border-gray-200 rounded-r-xl rounded-bl-xl p-4 shadow-sm relative">
                <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                        {block.type === 'hero' && <ImageIcon className="w-4 h-4 text-blue-500" />}
                        {block.type === 'text' && <Type className="w-4 h-4 text-gray-500" />}
                        {block.type === 'product-grid' && <ShoppingBag className="w-4 h-4 text-orange-500" />}
                        <span className="text-xs font-bold uppercase text-gray-500">{block.type} Block</span>
                    </div>
                    <button onClick={() => onDelete(block.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Render appropriate editor */}
                {block.type === 'hero' && <HeroEditor data={block.data} onChange={(d) => onChange(block.id, d)} />}
                {block.type === 'text' && <TextEditor data={block.data} onChange={(d) => onChange(block.id, d)} />}
                {block.type === 'product-grid' && <ProductGridEditor data={block.data} onChange={(d) => onChange(block.id, d)} categories={categories} />}
            </div>
        </div>
    );
};

// --- Main Builder Component ---

export const VisualBuilder: React.FC<VisualBuilderProps> = ({ initialTitle, initialContent, slug, categories, onSave, onClose }) => {
    const [title, setTitle] = useState(initialTitle);
    const [loading, setLoading] = useState(false);

    // Parse initial content - if it's not JSON, wrap existing HTML in a text block
    const [blocks, setBlocks] = useState<Block[]>(() => {
        try {
            const parsed = JSON.parse(initialContent);
            if (Array.isArray(parsed)) return parsed;
            throw new Error('Not an array');
        } catch (e) {
            if (initialContent) {
                return [{ id: '1', type: 'text', data: { content: initialContent } }];
            }
            return [];
        }
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: Date.now().toString(),
            type,
            data: type === 'product-grid' ? { category: '' } : {}
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (id: string, data: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, data } : b));
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const contentString = JSON.stringify(blocks);
            await onSave(slug, title, contentString);
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-[100] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="text-xl font-bold text-gray-900 border-none focus:ring-0 bg-transparent placeholder-gray-400"
                        placeholder="Page Title"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Page</>}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar / Tools */}
                <div className="w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Add Blocks</h3>
                    <div className="space-y-3">
                        <button onClick={() => addBlock('hero')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all text-left group">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100"><ImageIcon className="w-5 h-5" /></div>
                            <div>
                                <div className="font-bold text-gray-900 text-sm">Hero Section</div>
                                <div className="text-xs text-gray-500">Image with text overlay</div>
                            </div>
                        </button>
                        <button onClick={() => addBlock('text')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all text-left group">
                            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200"><Type className="w-5 h-5" /></div>
                            <div>
                                <div className="font-bold text-gray-900 text-sm">Rich Text</div>
                                <div className="text-xs text-gray-500">Paragraphs, lists, etc.</div>
                            </div>
                        </button>
                        <button onClick={() => addBlock('product-grid')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all text-left group">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100"><ShoppingBag className="w-5 h-5" /></div>
                            <div>
                                <div className="font-bold text-gray-900 text-sm">Product Grid</div>
                                <div className="text-xs text-gray-500">Display products by category</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                    <div className="max-w-3xl mx-auto min-h-full pb-32">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={blocks.map(b => b.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {blocks.map(block => (
                                        <SortableBlock
                                            key={block.id}
                                            block={block}
                                            onDelete={removeBlock}
                                            onChange={updateBlock}
                                            categories={categories}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {blocks.length === 0 && (
                            <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl">
                                <p>Your page is empty.</p>
                                <p>Add blocks from the sidebar to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
