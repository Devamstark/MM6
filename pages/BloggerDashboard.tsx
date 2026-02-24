import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BlogPost } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Eye, EyeOff, Clock, Save, X, ArrowLeft, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type EditorMode = 'list' | 'new' | 'edit';

const CATEGORIES = ['Style', 'Trends', 'Care', 'News', 'Lookbook'];

const emptyForm = {
    title: '',
    excerpt: '',
    content: '',
    category: 'Style',
    tags: '',
    coverImage: '',
    isFeatured: false,
    isPublished: false,
};

const PLACEHOLDER_POSTS: BlogPost[] = [
    {
        id: '1', title: 'The Art of Layering: Master Winter Fashion', slug: 'art-of-layering',
        excerpt: 'Discover how to create effortlessly stylish layered looks.',
        content: 'Full content here...', author: 'You', authorId: 'me',
        category: 'Style', tags: ['winter', 'layering'], isPublished: true, isFeatured: true,
        publishedAt: '2026-02-20T10:00:00Z', createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-02-20T10:00:00Z',
        readingTime: 5, views: 1240,
    },
];

export const BloggerDashboard = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<EditorMode>('list');
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await api.getBlogPosts({ author: user?.id });
            setPosts(data.length > 0 ? data : PLACEHOLDER_POSTS);
        } catch {
            setPosts(PLACEHOLDER_POSTS);
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setForm(emptyForm);
        setEditingPost(null);
        setMode('new');
    };

    const openEdit = (post: BlogPost) => {
        setEditingPost(post);
        setForm({
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            tags: post.tags.join(', '),
            coverImage: post.coverImage || '',
            isFeatured: post.isFeatured,
            isPublished: post.isPublished,
        });
        setMode('edit');
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.excerpt.trim()) return;
        setSaving(true);
        try {
            const payload = {
                title: form.title,
                excerpt: form.excerpt,
                content: form.content,
                category: form.category,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                cover_image: form.coverImage,
                is_featured: form.isFeatured,
                is_published: form.isPublished,
            };
            if (editingPost) {
                await api.updateBlogPost(editingPost.id, payload);
            } else {
                await api.createBlogPost(payload);
            }
            setSuccessMsg(editingPost ? 'Post updated!' : 'Post created!');
            setTimeout(() => setSuccessMsg(''), 3000);
            await loadPosts();
            setMode('list');
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this post? This cannot be undone.')) return;
        try {
            await api.deleteBlogPost(id);
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const handleTogglePublish = async (post: BlogPost) => {
        try {
            await api.publishBlogPost(post.id, !post.isPublished);
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isPublished: !p.isPublished } : p));
        } catch (e) {
            console.error(e);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* Success Toast */}
                <AnimatePresence>
                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg"
                        >
                            ✓ {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── LIST VIEW ─────────────────────────────────── */}
                {mode === 'list' && (
                    <>
                        <div className="flex items-center justify-between py-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Blog Posts</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Welcome back, <span className="font-semibold">{user?.name || user?.email}</span>
                                </p>
                            </div>
                            <button
                                onClick={openNew}
                                className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
                            >
                                <Plus className="w-4 h-4" />
                                New Post
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[
                                { label: 'Total Posts', value: posts.length },
                                { label: 'Published', value: posts.filter(p => p.isPublished).length },
                                { label: 'Total Views', value: posts.reduce((a, p) => a + (p.views || 0), 0).toLocaleString() },
                            ].map((s, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                                    <p className="text-xs text-gray-400 mt-0.5 font-medium">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Post List */}
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-20 bg-white dark:bg-gray-900 rounded-xl animate-pulse border border-gray-100 dark:border-gray-800" />
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                <p className="text-gray-400 font-medium">No posts yet. Write your first one!</p>
                                <button onClick={openNew} className="mt-4 text-sm text-indigo-600 font-semibold underline">Create post</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {posts.map(post => (
                                    <motion.div
                                        key={post.id}
                                        layout
                                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4"
                                    >
                                        {post.coverImage && (
                                            <img
                                                src={post.coverImage}
                                                alt=""
                                                className="w-16 h-14 object-cover rounded-lg shrink-0"
                                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        )}
                                        {!post.coverImage && (
                                            <div className="w-16 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0 flex items-center justify-center">
                                                <Image className="w-5 h-5 text-gray-300" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${post.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                    {post.isPublished ? 'Live' : 'Draft'}
                                                </span>
                                                <span className="text-[10px] text-gray-400">{post.category}</span>
                                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{post.readingTime}m</span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{post.title}</p>
                                            <p className="text-[11px] text-gray-400">{formatDate(post.createdAt)} · {(post.views || 0).toLocaleString()} views</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => handleTogglePublish(post)}
                                                title={post.isPublished ? 'Unpublish' : 'Publish'}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
                                            >
                                                {post.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => openEdit(post)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── EDITOR VIEW ─────────────────────────────────── */}
                {(mode === 'new' || mode === 'edit') && (
                    <div className="pt-6">
                        <button
                            onClick={() => setMode('list')}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to posts
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            {mode === 'new' ? 'Write a New Post' : 'Edit Post'}
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                            {/* Main editor */}
                            <div className="lg:col-span-2 space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Title *</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="Your post headline..."
                                        className="w-full px-4 py-3 text-base font-semibold border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Excerpt *</label>
                                    <textarea
                                        rows={2}
                                        value={form.excerpt}
                                        onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                        placeholder="Short summary — shown on the blog listing page..."
                                        className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Content</label>
                                    <textarea
                                        rows={14}
                                        value={form.content}
                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                        placeholder="Write your full article here. HTML is supported (e.g. <h2>, <p>, <strong>, <ul>)..."
                                        className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none resize-none font-mono leading-relaxed"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">HTML is supported. Use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, etc.</p>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-4">

                                {/* Publish settings */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Publish Settings</p>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`relative w-10 h-5 rounded-full transition-colors ${form.isPublished ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </div>
                                        <input type="checkbox" className="sr-only" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Publish immediately</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`relative w-10 h-5 rounded-full transition-colors ${form.isFeatured ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </div>
                                        <input type="checkbox" className="sr-only" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Featured post</span>
                                    </label>
                                </div>

                                {/* Category */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setForm({ ...form, category: cat })}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${form.category === cat
                                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cover image */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Cover Image URL</label>
                                    <input
                                        type="text"
                                        value={form.coverImage}
                                        onChange={e => setForm({ ...form, coverImage: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                                    />
                                    {form.coverImage && (
                                        <img
                                            src={form.coverImage}
                                            alt="Preview"
                                            className="mt-2 w-full h-28 object-cover rounded-lg border border-gray-100 dark:border-gray-800"
                                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    )}
                                </div>

                                {/* Tags */}
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Tags</label>
                                    <input
                                        type="text"
                                        value={form.tags}
                                        onChange={e => setForm({ ...form, tags: e.target.value })}
                                        placeholder="style, winter, lookbook (comma-separated)"
                                        className="w-full px-3 py-2.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setMode('list')}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || !form.title.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-40"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Saving…' : 'Save Post'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
