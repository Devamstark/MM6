import { atom } from 'jotai';
import { User, Product } from '../types';

export interface CartItem extends Product {
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
}

// User State
export const userAtom = atom<User | null>(null);
export const tokenAtom = atom<string | null>(null);

// Cart State
export const cartAtom = atom<CartItem[]>([]);

// Derived Cart Atoms
export const cartCountAtom = atom((get) => {
    const cart = get(cartAtom);
    return cart.reduce((total, item) => total + item.quantity, 0);
});

export const cartTotalAtom = atom((get) => {
    const cart = get(cartAtom);
    return cart.reduce((total, item) => total + (item.salePrice || item.price) * item.quantity, 0);
});

// UI State
export const isCartOpenAtom = atom(false);
export const isMobileMenuOpenAtom = atom(false);
export const searchQueryAtom = atom('');

// Theme State
export const isDarkModeAtom = atom<boolean>(localStorage.getItem('cm_theme_mode') === 'dark');
export const themeColorAtom = atom<string>(localStorage.getItem('cm_theme_color') || 'blue');
export const fontScaleAtom = atom<number>(parseFloat(localStorage.getItem('cm_font_scale') || '1'));
export const densityAtom = atom<string>(localStorage.getItem('cm_density') || 'comfortable');
