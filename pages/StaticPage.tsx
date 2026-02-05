import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PageContent, Product } from '../types';
import { Loader2, ArrowRight } from 'lucide-react';
import { Block } from '../components/VisualBuilder'; // You might need to export Block interface separately or redefine it
import { ProductCard } from '../components/ProductCard';

const fallbackContent: Record<string, { title: string, content: string }> = {
    // ... same fallbacks as before, kept for safety ...
};

// --- Block Renderers ---

const HeroRenderer = ({ data }: { data: any }) => (
    <div className="relative rounded-[2.5rem] overflow-hidden my-8 min-h-[400px] flex items-center">
        <div className="absolute inset-0">
            <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 p-12 max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-4 leading-tight">{data.title}</h1>
            <p className="text-xl text-white/90 mb-8">{data.subtitle}</p>
        </div>
    </div>
);

const TextRenderer = ({ data }: { data: any }) => (
    <div
        className="prose prose-lg max-w-none text-gray-600 my-8"
        dangerouslySetInnerHTML={{ __html: data.content }}
    />
);

const ProductGridRenderer = ({ data }: { data: any }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // If category is set, filter by it. Otherwise get all.
                const filters = data.category ? { category: data.category } : {};
                const res = await api.getProducts(filters);
                setProducts(res.slice(0, 4)); // Limit to 4 for now
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [data.category]);

    if (loading) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="my-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {data.category ? `${data.category} Collection` : 'Featured Products'}
                </h2>
                <Link to={`/products?category=${data.category || ''}`} className="text-sm font-bold border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors">
                    View All
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                ))}
            </div>
        </div>
    );
};

export const StaticPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<PageContent | null>(null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOldFormat, setIsOldFormat] = useState(false);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            if (slug) {
                const apiPage = await api.getPage(slug);
                if (apiPage) {
                    setPage(apiPage);
                    try {
                        const parsed = JSON.parse(apiPage.content);
                        if (Array.isArray(parsed)) {
                            setBlocks(parsed);
                            setIsOldFormat(false);
                        } else {
                            setIsOldFormat(true);
                        }
                    } catch (e) {
                        setIsOldFormat(true);
                    }
                } else {
                    // Fallback logic
                    const fb = fallbackContent[slug];
                    if (fb) {
                        setPage({ slug, title: fb.title, content: fb.content, updatedAt: new Date().toISOString() });
                        setIsOldFormat(true);
                    } else {
                        setPage(null);
                    }
                }
            }
            setLoading(false);
        };
        fetchPage();
    }, [slug]);

    if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    if (!page) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">Page Not Found</h1>
                <p className="text-gray-500">The page you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {!isOldFormat ? (
                // Render Blocks
                <div>
                    {blocks.map((block) => (
                        <React.Fragment key={block.id}>
                            {block.type === 'hero' && <HeroRenderer data={block.data} />}
                            {block.type === 'text' && <TextRenderer data={block.data} />}
                            {block.type === 'product-grid' && <ProductGridRenderer data={block.data} />}
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                // Old HTML render
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
                        {page.title}
                    </h1>
                    <div
                        className="prose prose-indigo max-w-none text-gray-600"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </div>
            )}
        </div>
    );
};
