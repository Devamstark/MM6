import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { BlogPost } from '../types';
import { ArrowLeft, Clock, Eye, Calendar, Tag, User, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';

const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

const CATEGORY_COLORS: Record<string, string> = {
    Style: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    Trends: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    Care: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    News: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Lookbook: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export const BlogPostDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useSEO({
        title: post ? `${post.title} | SmartShop Blog` : 'Loading... | SmartShop Blog',
        description: post?.excerpt || 'Read more on SmartShop Blog - Your trusted fashion destination',
        canonical: post ? `https://smartshop1.us/blog/${post.slug}` : undefined,
        ogImage: post?.coverImage,
    });

    useEffect(() => {
        const loadPost = async () => {
            if (!slug) return;
            setLoading(true);
            setError(false);
            try {
                const data = await api.getBlogPost(slug);
                setPost(data);
            } catch (err) {
                console.error('Failed to load blog post:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [slug]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post?.title,
                text: post?.excerpt,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="animate-pulse space-y-8">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                        <div className="space-y-4">
                            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Post Not Found
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Sorry, we couldn't find this blog post.
                    </p>
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-white dark:bg-gray-950 pt-24 pb-16"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Back Link */}
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blog
                </Link>

                {/* Header */}
                <header className="mb-8">
                    {/* Category & Meta */}
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                            {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                        {post.readingTime && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                {post.readingTime} min read
                            </span>
                        )}
                        {!!post.views && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Eye className="w-3 h-3" />
                                {post.views.toLocaleString()} views
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                        {post.title}
                    </h1>

                    {/* Excerpt */}
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {post.excerpt}
                    </p>

                    {/* Author & Share */}
                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                        {post.author && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <User className="w-4 h-4" />
                                <span className="font-semibold">By {post.author}</span>
                            </div>
                        )}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </header>

                {/* Cover Image */}
                {post.coverImage && (
                    <div className="mb-10 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-auto max-h-[80vh] object-contain"
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose prose-lg dark:prose-invert max-w-none
                        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                        prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:font-semibold prose-a:underline
                        prose-ul:my-6 prose-li:text-gray-700 dark:prose-li:text-gray-300
                        prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic
                        prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-300
                        prose-img:rounded-xl prose-img:my-8
                        prose-hr:border-gray-200 dark:prose-hr:border-gray-800"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4 text-gray-400" />
                            {post.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="text-xs font-semibold px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer CTA */}
                <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Enjoyed this post?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Explore more fashion insights, style guides, and trend reports on the SmartShop blog.
                    </p>
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Browse All Posts
                    </Link>
                </div>
            </div>
        </motion.article>
    );
};
