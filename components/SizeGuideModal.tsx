import React, { useEffect, useState } from 'react';
import { X, Ruler, Info } from 'lucide-react';

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: 'men' | 'women' | 'unisex';
}

const menSizes = [
    { size: 'S', chest: '34-36', waist: '28-30', hips: '34-36', length: '27' },
    { size: 'M', chest: '38-40', waist: '32-34', hips: '38-40', length: '28' },
    { size: 'L', chest: '42-44', waist: '36-38', hips: '42-44', length: '29' },
    { size: 'XL', chest: '46-48', waist: '40-42', hips: '46-48', length: '30' },
    { size: 'XXL', chest: '50-52', waist: '44-46', hips: '50-52', length: '31' },
];

const womenSizes = [
    { size: 'XS', bust: '30-32', waist: '22-24', hips: '32-34' },
    { size: 'S', bust: '32-34', waist: '24-26', hips: '34-36' },
    { size: 'M', bust: '36-38', waist: '28-30', hips: '38-40' },
    { size: 'L', bust: '40-42', waist: '32-34', hips: '42-44' },
    { size: 'XL', bust: '44-46', waist: '36-38', hips: '46-48' },
];

export const SizeGuideModal = ({ isOpen, onClose, category = 'unisex' }: SizeGuideModalProps) => {
    const [activeTab, setActiveTab] = useState<'men' | 'women'>(category === 'women' ? 'women' : 'men');

    useEffect(() => {
        if (isOpen && (category === 'women' || category === 'men')) {
            setActiveTab(category);
        }
    }, [isOpen, category]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const currentSizes = activeTab === 'men' ? menSizes : womenSizes;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Side Modal - Slides from Right */}
            <div
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out overflow-y-auto"
                style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <Ruler className="w-6 h-6 text-indigo-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Size Guide</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Close size guide"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Gender Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('men')}
                            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'men'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            Men's
                        </button>
                        <button
                            onClick={() => setActiveTab('women')}
                            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'women'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            Women's
                        </button>
                    </div>

                    {/* Size Chart */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            {activeTab === 'men' ? "Men's" : "Women's"} Size Chart
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-3 font-bold text-gray-900 dark:text-white">Size</th>
                                        {activeTab === 'men' ? (
                                            <>
                                                <th className="text-center py-3 px-3 font-bold text-gray-900 dark:text-white">Chest</th>
                                                <th className="text-center py-3 px-3 font-bold text-gray-900 dark:text-white">Waist</th>
                                                <th className="text-center py-3 px-3 font-bold text-gray-900 dark:text-white">Hips</th>
                                                <th className="text-center py-3 px-3 font-bold text-gray-900 dark:text-white">Length</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="text-center py-3 px-3 font-bold text-gray-900 dark:text-white">Bust</th>
                                                <th className="text-center py-3 px-3 font-bold text-gray-900 dark:text-white">Waist</th>
                                                <th className="text-center py-3 px-3 font-bold text-gray-900 dark:text-white">Hips</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentSizes.map((sizeData, index) => (
                                        <tr
                                            key={sizeData.size}
                                            className={`border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0
                                                    ? 'bg-gray-50 dark:bg-gray-800/50'
                                                    : 'bg-white dark:bg-gray-900'
                                                }`}
                                        >
                                            <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                                                {sizeData.size}
                                            </td>
                                            {'chest' in sizeData && (
                                                <td className="text-center py-3 px-3 text-gray-600 dark:text-gray-400">
                                                    {sizeData.chest}"
                                                </td>
                                            )}
                                            {'bust' in sizeData && (
                                                <td className="text-center py-3 px-3 text-gray-600 dark:text-gray-400">
                                                    {sizeData.bust}"
                                                </td>
                                            )}
                                            <td className="text-center py-3 px-3 text-gray-600 dark:text-gray-400">
                                                {sizeData.waist}"
                                            </td>
                                            <td className="text-center py-3 px-3 text-gray-600 dark:text-gray-400">
                                                {sizeData.hips}"
                                            </td>
                                            {'length' in sizeData && (
                                                <td className="text-center py-3 px-3 text-gray-600 dark:text-gray-400">
                                                    {sizeData.length}"
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* How to Measure */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-bold text-gray-900 dark:text-white">How to Measure</h3>
                        </div>
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">1</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Chest/Bust</p>
                                    <p>Measure around the fullest part of your chest/bust, keeping the tape level.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">2</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Waist</p>
                                    <p>Measure around your natural waistline (narrowest part of your torso).</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">3</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Hips</p>
                                    <p>Measure around the widest part of your hips, keeping feet together.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">4</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Length</p>
                                    <p>Measure from the highest point of the shoulder to the desired hem.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fit Tips */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-100 dark:border-amber-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Fit Tips</h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>
                                <span>If you're between sizes, we recommend sizing up for a more comfortable fit.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>
                                <span>Consider the garment's intended fit (slim, regular, or relaxed).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>
                                <span>For layering, choose a size that accommodates additional clothing underneath.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Footer Note */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p>All measurements are approximate and may vary by 0.5-1 inch.</p>
                        <p className="mt-1">For more details, visit our <a href="/page/size-guide" className="text-indigo-600 hover:underline">full size guide page</a>.</p>
                    </div>
                </div>
            </div>
        </>
    );
};
