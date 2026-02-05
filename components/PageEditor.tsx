import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X, Save, Loader2 } from 'lucide-react';

interface PageEditorProps {
    initialTitle: string;
    initialContent: string;
    slug: string;
    onSave: (slug: string, title: string, content: string) => Promise<void>;
    onClose: () => void;
}

export const PageEditor: React.FC<PageEditorProps> = ({ initialTitle, initialContent, slug, onSave, onClose }) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(slug, title, content);
            onClose();
        } catch (error) {
            console.error('Failed to save page:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
                    <div className="flex-1 mr-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Page Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-xl font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300"
                            placeholder="Enter page title..."
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="prose max-w-none">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            className="h-[50vh] mb-12"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 rounded-xl font-bold bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
