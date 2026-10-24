"use client";

import { ICartItem } from "@/types/customer-app/product.interface";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "sehela.cart.v1";

interface ICartContext {
  items: ICartItem[];
  isCartReady: boolean;
  addItem: (item: ICartItem) => void;
  updateQuantity: (variantId: string, locationId: string, quantity: number) => void;
  removeItem: (variantId: string, locationId: string) => void;
  clearCart: () => void;
  subtotal: number;
  locationId: string | null;
  locationName: string | null;
  hasMixedLocations: boolean;
}

const CartContext = createContext<ICartContext | undefined>(undefined);

const readCart = (): ICartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<ICartItem[]>([]);
  const [isCartReady, setIsCartReady] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setIsCartReady(true);
  }, []);

  useEffect(() => {
    if (!isCartReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isCartReady]);

  const addItem = (item: ICartItem) => {
    setItems((prev) => {
      const found = prev.find((i) => i.variant_id === item.variant_id && i.location_id === item.location_id);
      if (found) {
        return prev.map((i) =>
          i.variant_id === item.variant_id && i.location_id === item.location_id ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (variantId: string, locationId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.variant_id === variantId && i.location_id === locationId ? { ...i, quantity } : i)),
    );
  };

  const removeItem = (variantId: string, locationId: string) => {
    setItems((prev) => prev.filter((i) => !(i.variant_id === variantId && i.location_id === locationId)));
  };

  const clearCart = () => setItems([]);

  const { subtotal, locationId, locationName, hasMixedLocations } = useMemo(() => {
    const locations = new Set(items.map((i) => i.location_id));
    return {
      subtotal: items.reduce((sum, i) => sum + i.price_idr * i.quantity, 0),
      locationId: items[0]?.location_id ?? null,
      locationName: items[0]?.location_name ?? null,
      hasMixedLocations: locations.size > 1,
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, isCartReady, addItem, updateQuantity, removeItem, clearCart, subtotal, locationId, locationName, hasMixedLocations }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): ICartContext => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
