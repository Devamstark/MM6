import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { BlogPost } from '../types';
import { Clock, Eye, ChevronRight, PenLine, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';

const CATEGORIES = ['All', 'Style', 'Trends', 'Care', 'News', 'Lookbook'];

const CATEGORY_COLORS: Record<string, string> = {
    Style: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    Trends: 'bg-pink-100   text-pink-700   dark:bg-pink-900/30   dark:text-pink-400',
    Care: 'bg-sky-100    text-sky-700    dark:bg-sky-900/30    dark:text-sky-400',
    News: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    Lookbook: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
};

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── Skeleton loader ───────────────────────────────────────── */
const SkeletonCard = () => (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800" />
        <div className="p-4 space-y-2.5">
            <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
            <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
    </div>
);

/* ── Empty state ───────────────────────────────────────────── */
const EmptyState = ({ filtered }: { filtered: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full flex flex-col items-center justify-center py-20 text-center"
    >
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <PenLine className="w-7 h-7 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {filtered ? 'No posts in this category yet' : 'No posts published yet'}
        </h3>
        <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            {filtered
                ? 'Try another category or check back soon.'
                : 'Our bloggers are working on something great. Check back soon!'}
        </p>
    </motion.div>
);

/* ── Featured hero card ────────────────────────────────────── */
const FeaturedCard = ({ post }: { post: BlogPost }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link
            to={`/blog/${post.slug}`}
            className="group grid md:grid-cols-5 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 bg-white dark:bg-gray-900"
        >
            {/* Image — takes 3 of 5 cols */}
            <div className="md:col-span-3 relative overflow-hidden bg-gray-100 dark:bg-gray-800 min-h-[220px] md:min-h-[320px]">
                {post.coverImage ? (
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <PenLine className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                    </div>
                )}
                <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                    Featured
                </span>
            </div>

            {/* Content — takes 2 of 5 cols */}
            <div className="md:col-span-2 p-6 md:p-8 flex flex-col justify-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {post.category}
                    </span>
                    <span className="text-[11px] text-gray-400">
                        {formatDate(post.publishedAt ?? post.createdAt)}
                    </span>
                </div>

                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        {post.readingTime && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {post.readingTime}m read
                            </span>
                        )}
                        {!!post.views && (
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" /> {post.views.toLocaleString()}
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                        Read <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                </div>

                {post.author && (
                    <p className="text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3 mt-auto">
                        By <span className="font-semibold text-gray-600 dark:text-gray-300">{post.author}</span>
                    </p>
                )}
            </div>
        </Link>
    </motion.div>
);

/* ── Small grid card ───────────────────────────────────────── */
const PostCard = ({ post, index }: { post: BlogPost; index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
    >
        <Link
            to={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 h-full bg-white dark:bg-gray-900"
        >
            {/* Thumbnail */}
            <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video shrink-0">
                {post.coverImage ? (
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <PenLine className="w-8 h-8 text-gray-200 dark:text-gray-700" />
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col grow gap-2">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {post.category}
                    </span>
                    <span className="text-[10px] text-gray-400">{formatDate(post.publishedAt ?? post.createdAt)}</span>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed grow">
                    {post.excerpt}
                </p>

                <div className="flex items-center gap-3 pt-3 mt-auto border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
                    {post.readingTime && (
                        <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {post.readingTime}m</span>
                    )}
                    {post.author && <span className="truncate">{post.author}</span>}
                    {!!post.views && (
                        <span className="flex items-center gap-1 ml-auto"><Eye className="w-2.5 h-2.5" /> {post.views.toLocaleString()}</span>
                    )}
                </div>
            </div>
        </Link>
    </motion.div>
);

/* ── Main page ─────────────────────────────────────────────── */
export const Blog = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');

    useSEO({
        title: 'Fashion Blog — Style Guides, Trends & Lookbooks | SmartShop',
        description: 'Read the SmartShop fashion journal. Style guides, trend reports, outfit ideas and care tips from our editors and community bloggers.',
        canonical: 'https://smartshop1.us/blog',
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(false);
            try {
                const data = await api.getBlogPosts({});
                setPosts(Array.isArray(data) ? data : []);
            } catch {
                setError(true);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = activeCategory === 'All'
        ? posts
        : posts.filter(p => p.category === activeCategory);

    const featured = filtered.find(p => p.isFeatured) ?? filtered[0];
    const rest = filtered.filter(p => p.id !== featured?.id);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">

                {/* ── Page Header ─────────────────────────────────── */}
                <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">
                                SmartShop Journal
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Fashion Blogger
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-lg">
                                Style guides, trend reports, care tips &amp; lookbooks from our editors and community.
                            </p>
                        </div>
                        {posts.length > 0 && (
                            <p className="text-xs text-gray-400 shrink-0 hidden sm:block">
                                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Category Tabs ────────────────────────────────── */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-7 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeCategory === cat
                                ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 dark:bg-transparent dark:text-gray-400 dark:border-gray-800 dark:hover:border-gray-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* ── Error state ─────────────────────────────────── */}
                {error && (
                    <div className="text-center py-16 text-sm text-gray-400">
                        Could not load posts. Please refresh and try again.
                    </div>
                )}

                {/* ── Loading skeletons ────────────────────────────── */}
                {loading && !error && (
                    <>
                        {/* Featured skeleton */}
                        <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse grid md:grid-cols-5">
                            <div className="md:col-span-3 min-h-[220px] md:min-h-[320px] bg-gray-100 dark:bg-gray-800" />
                            <div className="md:col-span-2 p-8 space-y-3">
                                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
                                <div className="h-5 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
                                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                                <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded" />
                            </div>
                        </div>
                        {/* Grid skeletons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    </>
                )}

                {/* ── Content ──────────────────────────────────────── */}
                {!loading && !error && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {filtered.length === 0 ? (
                                <div className="grid">
                                    <EmptyState filtered={activeCategory !== 'All'} />
                                </div>
                            ) : (
                                <>
                                    {/* Featured */}
                                    {featured && <FeaturedCard post={featured} />}

                                    {/* Grid */}
                                    {rest.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                            {rest.map((post, i) => (
                                                <PostCard key={post.id} post={post} index={i} />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}

            </div>
        </div>
    );
};
