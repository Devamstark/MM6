import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { isDarkModeAtom, themeColorAtom, fontScaleAtom, densityAtom } from '../store/atoms';
import { X, Moon, Sun, Type, Layout, Palette, Monitor } from 'lucide-react';

interface ThemeCustomizerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ThemeCustomizer = ({ isOpen, onClose }: ThemeCustomizerProps) => {
    const [isDarkMode, setIsDarkMode] = useAtom(isDarkModeAtom);
    const [themeColor, setThemeColor] = useAtom(themeColorAtom);
    const [fontScale, setFontScale] = useAtom(fontScaleAtom);
    const [density, setDensity] = useAtom(densityAtom);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-80 bg-white h-full shadow-2xl p-6 overflow-y-auto animate-fade-in border-l border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Customize</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-800 dark:text-gray-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Dark Mode */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider">
                            <Monitor className="w-4 h-4" />
                            Display Mode
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsDarkMode(false)}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium ${!isDarkMode
                                    ? 'border-black bg-gray-50 text-black dark:border-white'
                                    : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                            >
                                <Sun className="w-4 h-4" /> Light
                            </button>
                            <button
                                onClick={() => setIsDarkMode(true)}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium ${isDarkMode
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500'
                                    : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                            >
                                <Moon className="w-4 h-4" /> Dark
                            </button>
                        </div>
                    </section>

                    {/* Theme Color */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider">
                            <Palette className="w-4 h-4" />
                            Accent Color
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {['blue', 'purple', 'green', 'orange', 'red', 'teal', 'pink'].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setThemeColor(color)}
                                    className={`h-12 rounded-xl transition-all border-2 flex items-center justify-center ${themeColor === color ? 'border-gray-900 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'
                                        }`}
                                    style={{
                                        backgroundColor:
                                            color === 'blue' ? '#3b82f6' :
                                                color === 'purple' ? '#8b5cf6' :
                                                    color === 'green' ? '#10b981' :
                                                        color === 'orange' ? '#f97316' :
                                                            color === 'red' ? '#ef4444' :
                                                                color === 'teal' ? '#14b8a6' :
                                                                    '#ec4899' // pink
                                    }}
                                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                                >
                                    {themeColor === color && <div className="w-2 h-2 bg-white rounded-full" />}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Font Scale */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider">
                            <Type className="w-4 h-4" />
                            Text Size
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl dark:bg-gray-800">
                            <span className="text-xs font-bold text-gray-400 px-2">Aa</span>
                            <input
                                type="range"
                                min="0.8"
                                max="1.2"
                                step="0.1"
                                value={fontScale}
                                onChange={(e) => setFontScale(parseFloat(e.target.value))}
                                className="flex-1 accent-black dark:accent-white h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xl font-bold text-gray-900 dark:text-white px-2">Aa</span>
                        </div>
                    </section>

                    {/* Layout Density */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-400 uppercase tracking-wider">
                            <Layout className="w-4 h-4" />
                            Density
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDensity('comfortable')}
                                className={`p-3 rounded-xl border-2 transition-all font-medium text-sm ${density === 'comfortable'
                                    ? 'border-black bg-white text-black dark:border-white dark:bg-gray-800 dark:text-white'
                                    : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                            >
                                Comfortable
                            </button>
                            <button
                                onClick={() => setDensity('compact')}
                                className={`p-3 rounded-xl border-2 transition-all font-medium text-sm ${density === 'compact'
                                    ? 'border-black bg-white text-black dark:border-white dark:bg-gray-800 dark:text-white'
                                    : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                            >
                                Compact
                            </button>
                        </div>
                    </section>
                </div>

                <div className="mt-12 p-4 bg-gray-50 rounded-xl text-center dark:bg-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Preferences are saved automatically to your device.
                    </p>
                </div>
            </div>
        </div>
    );
};
