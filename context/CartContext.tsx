import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from local storage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cm_cart');
    if (storedCart) {
      try {
        // Simple obfuscation using Base64 to hide plain text JSON
        const decoded = atob(storedCart);
        setItems(JSON.parse(decoded));
      } catch (e) {
        console.error("Failed to parse cart", e);
        localStorage.removeItem('cm_cart');
      }
    }
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    // Simple obfuscation using Base64
    const json = JSON.stringify(items);
    const encoded = btoa(json);
    localStorage.setItem('cm_cart', encoded);
  }, [items]);

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);

      // Check stock limit
      const currentQty = existing ? existing.quantity : 0;
      const stock = product.stock !== undefined ? product.stock : Infinity;

      if (currentQty + 1 > stock) {
        alert(`Sorry, only ${stock} items in stock!`);
        return prev;
      }

      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1, stock: product.stock } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(productId);

    setItems(prev => {
      const item = prev.find(i => i.id === productId);
      if (!item) return prev;

      const stock = item.stock !== undefined ? item.stock : Infinity;
      if (quantity > stock) {
        alert(`Sorry, only ${stock} items in stock!`);
        return prev.map(i => i.id === productId ? { ...i, quantity: stock } : i);
      }

      return prev.map(i => i.id === productId ? { ...i, quantity } : i);
    });
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};