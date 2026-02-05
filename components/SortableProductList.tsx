import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product } from '../types';
import { GripVertical } from 'lucide-react';

interface SortableProductListProps {
    products: Product[];
    onReorder: (products: Product[]) => void;
    onSave: () => void;
    saving?: boolean;
}

const SortableItem = ({ product }: { product: Product }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center bg-white p-3 mb-2 rounded-xl border border-gray-100 shadow-sm"
        >
            <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 mr-3">
                <GripVertical className="w-5 h-5" />
            </div>
            <img
                src={product.imageUrl}
                alt={product.name}
                className="h-12 w-12 rounded-lg object-cover bg-gray-50 border border-gray-100"
            />
            <div className="ml-4 flex-1">
                <div className="font-bold text-gray-900 text-sm">{product.name}</div>
                <div className="text-xs text-gray-500">${product.price}</div>
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
                Order: {product.display_order ?? 0}
            </div>
        </div>
    );
};

export const SortableProductList: React.FC<SortableProductListProps> = ({ products, onReorder, onSave, saving }) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = products.findIndex((p) => p.id === active.id);
            const newIndex = products.findIndex((p) => p.id === over.id);

            const newOrder = arrayMove(products, oldIndex, newIndex);

            // Update display_order property based on new index
            const updatedOrder = newOrder.map((p, index) => ({
                ...p,
                display_order: index
            }));

            onReorder(updatedOrder);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Reorder Featured Products</h3>
                    <p className="text-sm text-gray-500">Drag and drop to change the order on the home page.</p>
                </div>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="bg-black text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Order'}
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={products.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {products.map((product) => (
                            <SortableItem key={product.id} product={product} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};
