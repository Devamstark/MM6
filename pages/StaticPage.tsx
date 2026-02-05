import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PageContent, Product } from '../types';
import { Loader2, ArrowRight } from 'lucide-react';
import { Block } from '../components/VisualBuilder'; // You might need to export Block interface separately or redefine it
import { ProductCard } from '../components/ProductCard';

const fallbackContent: Record<string, { title: string, content: string }> = {
    'about-us': {
        title: 'About Us',
        content: `
      <p class="mb-4">CloudMart started in January 2026 by team MM6 from class IT 495. We are dedicated to providing the best e-commerce experience.</p>
      <p class="mb-4">Our mission is to bring high-quality products to customers worldwide with exceptional service and speed.</p>
      <h3 class="text-xl font-bold mt-6 mb-3">Our Team</h3>
      <p>Team MM6 consists of passionate developers and designers working together to build next-generation shopping platforms.</p>
    `
    },
    'shipping-info': {
        title: 'Shipping Information',
        content: `
      <p class="mb-4">We offer worldwide shipping. Standard shipping takes 5-7 business days.</p>
      <p>Express shipping is available for select locations and takes 2-3 business days.</p>
    `
    },
    'returns': {
        title: 'Returns Policy',
        content: `
      <p class="mb-4">You can return any item within 30 days of purchase if you are not completely satisfied.</p>
      <p>Items must be unused and in original packaging.</p>
    `
    },
    'how-to-order': {
        title: 'How to Order',
        content: `
      <ol class="list-decimal pl-5 space-y-2">
        <li>Browse our catalog and add items to your cart.</li>
        <li>Proceed to checkout.</li>
        <li>Enter your shipping and payment details.</li>
        <li>Confirm your order.</li>
      </ol>
    `
    },
    'size-guide': {
        title: 'Size Guide',
        content: `
      <p class="mb-4">Please refer to the measurements below:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li>S: Chest 34-36"</li>
        <li>M: Chest 38-40"</li>
        <li>L: Chest 42-44"</li>
        <li>XL: Chest 46-48"</li>
      </ul>
    `
    },
    'fashion-blogger': {
        title: 'Fashion Blogger Program',
        content: `
      <p class="mb-4">Are you a fashion enthusiast? Join our blogger program and get exclusive perks!</p>
      <p>Contact us at bloggers@cloudmart.com for more info.</p>
    `
    },
    'payment-method': {
        title: 'Payment Methods',
        content: `
      <p class="mb-4">We accept the following payment methods:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li>Credit/Debit Cards (Visa, Mastercard, Amex)</li>
        <li>PayPal</li>
        <li>Apple Pay</li>
        <li>Google Pay</li>
      </ul>
    `
    }
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
