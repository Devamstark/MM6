import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { BlogPost } from '../types';
import { Clock, Eye, Tag, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Style', 'Trends', 'Care', 'News', 'Lookbook'];

const PLACEHOLDER_POSTS: BlogPost[] = [
    {
        id: '1', title: 'The Art of Layering: Master Winter Fashion', slug: 'art-of-layering',
        excerpt: 'Discover how to create effortlessly stylish layered looks that keep you warm and on-trend all winter long.',
        content: '', author: 'SmartShop Editorial', authorId: 'ed',
        category: 'Style', tags: ['winter', 'layering'], isPublished: true, isFeatured: true,
        publishedAt: '2026-02-20T10:00:00Z', createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-02-20T10:00:00Z',
        readingTime: 5, views: 1240,
        coverImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80',
    },
    {
        id: '2', title: '2026 Spring Colour Palette: What to Expect', slug: 'spring-2026-colours',
        excerpt: 'From digital lavender to warm terracotta — we break down the colours dominating fashion this spring.',
        content: '', author: 'Vrushika G.', authorId: 'vg',
        category: 'Trends', tags: ['spring', 'colour'], isPublished: true, isFeatured: false,
        publishedAt: '2026-02-18T09:00:00Z', createdAt: '2026-02-18T09:00:00Z', updatedAt: '2026-02-18T09:00:00Z',
        readingTime: 4, views: 876,
        coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    },
    {
        id: '3', title: 'How to Care for Your Cashmere Pieces', slug: 'cashmere-care-guide',
        excerpt: 'Cashmere is an investment. Here is how to wash, store, and maintain it so it lasts a lifetime.',
        content: '', author: 'SmartShop Editorial', authorId: 'ed',
        category: 'Care', tags: ['knitwear', 'care'], isPublished: true, isFeatured: false,
        publishedAt: '2026-02-15T08:00:00Z', createdAt: '2026-02-15T08:00:00Z', updatedAt: '2026-02-15T08:00:00Z',
        readingTime: 3, views: 543,
        coverImage: 'https://images.unsplash.com/photo-1516762689617-e1cfffcdd7ee?w=600&q=80',
    },
    {
        id: '4', title: 'Street Style Decoded: Our Favourite Looks', slug: 'street-style-decoded',
        excerpt: 'We hit the streets to capture the best real-world fashion moments and break down how to recreate them.',
        content: '', author: 'Vrushika G.', authorId: 'vg',
        category: 'Lookbook', tags: ['street', 'lookbook'], isPublished: true, isFeatured: false,
        publishedAt: '2026-02-10T11:00:00Z', createdAt: '2026-02-10T11:00:00Z', updatedAt: '2026-02-10T11:00:00Z',
        readingTime: 6, views: 1890,
        coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
    },
    {
        id: '5', title: 'SmartShop x Nike: New Collection Drop', slug: 'smartshop-nike-collection',
        excerpt: 'The wait is over — our exclusive Nike collaboration is live. Here is everything you need to know.',
        content: '', author: 'SmartShop Team', authorId: 'team',
        category: 'News', tags: ['collaboration', 'nike'], isPublished: true, isFeatured: false,
        publishedAt: '2026-02-05T12:00:00Z', createdAt: '2026-02-05T12:00:00Z', updatedAt: '2026-02-05T12:00:00Z',
        readingTime: 2, views: 3210,
        coverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    },
];

const categoryColor: Record<string, string> = {
    Style: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Trends: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    Care: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    News: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Lookbook: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export const Blog = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.getBlogPosts({});
                setPosts(data.length > 0 ? data : PLACEHOLDER_POSTS);
            } catch {
                setPosts(PLACEHOLDER_POSTS);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = activeCategory === 'All'
        ? posts
        : posts.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

    const featured = filtered.find(p => p.isFeatured) || filtered[0];
    const rest = filtered.filter(p => p.id !== featured?.id);

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 pt-20 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center pt-10 pb-8 border-b border-gray-100 dark:border-gray-800 mb-8">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">SmartShop Journal</p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Fashion Blogger</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                        Style guides, trend reports, care tips &amp; behind-the-scenes from our editors and community bloggers.
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCategory === cat
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 animate-pulse">
                                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                                <div className="p-4 space-y-2">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Featured post */}
                        {featured && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8"
                            >
                                <Link to={`/blog/${featured.slug}`} className="group block rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300">
                                    <div className="grid md:grid-cols-2">
                                        <div className="relative h-64 md:h-auto overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            {featured.coverImage && (
                                                <img
                                                    src={featured.coverImage}
                                                    alt={featured.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/900x500/f3f4f6/9ca3af?text=Blog'; }}
                                                />
                                            )}
                                            <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                                                Featured
                                            </span>
                                        </div>
                                        <div className="p-6 md:p-8 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${categoryColor[featured.category] || 'bg-gray-100 text-gray-600'}`}>
                                                    {featured.category}
                                                </span>
                                                <span className="text-[11px] text-gray-400">{formatDate(featured.publishedAt || featured.createdAt)}</span>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                                                {featured.title}
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
                                                {featured.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.readingTime}m read</span>
                                                    {featured.views && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {featured.views.toLocaleString()}</span>}
                                                </div>
                                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    Read more <ChevronRight className="w-3.5 h-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )}

                        {/* Post grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {rest.map((post, i) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <Link to={`/blog/${post.slug}`} className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 h-full bg-white dark:bg-gray-900">
                                        <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video">
                                            {post.coverImage && (
                                                <img
                                                    src={post.coverImage}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x340/f3f4f6/9ca3af?text=Blog'; }}
                                                />
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col grow">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor[post.category] || 'bg-gray-100 text-gray-600'}`}>
                                                    {post.category}
                                                </span>
                                                <span className="text-[10px] text-gray-400">{formatDate(post.publishedAt || post.createdAt)}</span>
                                            </div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                                                {post.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed grow">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readingTime}m</span>
                                                <span className="truncate">{post.author}</span>
                                                {post.views && <span className="flex items-center gap-1 ml-auto"><Eye className="w-3 h-3" /> {post.views.toLocaleString()}</span>}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {filtered.length === 0 && (
                            <div className="text-center py-16 text-gray-400">
                                <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">No posts in this category yet.</p>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};
