import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Product, LabTest, HealthPackage } from '../backend';

export type CartItemType = 'product' | 'labTest' | 'healthPackage';

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  price: number;        // effective (discounted) price
  marketPrice: number;  // original price for discount display
  imageUrl: string;
  quantity: number;
  requiresPrescription: boolean;
  // original data references
  product?: Product;
  labTest?: LabTest;
  healthPackage?: HealthPackage;
}

interface CartContextType {
  items: CartItem[];
  addProductToCart: (product: Product, quantity?: number) => void;
  addLabTestToCart: (labTest: LabTest, quantity?: number) => void;
  addHealthPackageToCart: (pkg: HealthPackage, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  grandTotal: number;
  hasRxItems: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === newItem.id);
      if (existing) {
        return prev.map(i =>
          i.id === newItem.id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const addProductToCart = useCallback((product: Product, quantity = 1) => {
    const effectivePrice = product.discountedPrice
      ? Number(product.discountedPrice)
      : Number(product.price);
    addItem({
      id: `product-${product.id}`,
      type: 'product',
      name: product.name,
      price: effectivePrice,
      marketPrice: Number(product.price),
      imageUrl: product.imageUrl,
      quantity,
      requiresPrescription: product.requiresPrescription,
      product,
    });
  }, [addItem]);

  const addLabTestToCart = useCallback((labTest: LabTest, quantity = 1) => {
    addItem({
      id: `labTest-${labTest.id}`,
      type: 'labTest',
      name: labTest.name,
      price: Number(labTest.discountedPrice),
      marketPrice: Number(labTest.marketPrice),
      imageUrl: labTest.imageUrl,
      quantity,
      requiresPrescription: false,
      labTest,
    });
  }, [addItem]);

  const addHealthPackageToCart = useCallback((pkg: HealthPackage, quantity = 1) => {
    addItem({
      id: `healthPackage-${pkg.id}`,
      type: 'healthPackage',
      name: pkg.name,
      price: Number(pkg.discountedPrice),
      marketPrice: Number(pkg.marketPrice),
      imageUrl: pkg.imageUrl,
      quantity,
      requiresPrescription: false,
      healthPackage: pkg,
    });
  }, [addItem]);

  const removeFromCart = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev =>
        prev.map(i => i.id === id ? { ...i, quantity } : i)
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = items.reduce((sum, i) => sum + i.marketPrice * i.quantity, 0);

  const totalDiscount = items.reduce((sum, i) => {
    return sum + (i.marketPrice - i.price) * i.quantity;
  }, 0);

  const grandTotal = subtotal - totalDiscount;

  const hasRxItems = items.some(i => i.requiresPrescription);

  return (
    <CartContext.Provider value={{
      items,
      addProductToCart,
      addLabTestToCart,
      addHealthPackageToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      totalDiscount,
      grandTotal,
      hasRxItems,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
