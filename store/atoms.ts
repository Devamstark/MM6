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
