"use client";

import { IAdminCartItemData, ICustomerData } from "@/types/orders.interface";
import type React from "react";

import { createContext, useContext, useState } from "react";

interface IAdminCartContext {
  cartItems?: IAdminCartItemData[];
  addItem: (item: Omit<IAdminCartItemData, "subtotal">) => void;
  removeItem: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  updateItem: (id: number | string, updates: Partial<IAdminCartItemData>) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
  addCustomer: (data?: ICustomerData) => void;
  customerData?: ICustomerData;
  stepper: number;
  updateStepper: () => void;
}

const AddTransactionContext = createContext<IAdminCartContext | undefined>(undefined);

export function AddTransactionProvider({ children }: { children: React.ReactNode; showNav?: boolean }) {
  const [customerData, setCustomerData] = useState<ICustomerData | undefined>(undefined);
  const [cartItems, setCartItems] = useState<IAdminCartItemData[]>([]);
  const [stepper, setStepper] = useState<number>(1);

  const calculateSubtotal = (price: number, quantity: number): number => {
    return price * quantity;
  };

  const addItem = (item: Omit<IAdminCartItemData, "subtotal">): void => {
    // Check if item already exists
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      // Update quantity if exists
      updateQuantity(existingItem.id as number, existingItem.quantity + item.quantity);
    } else {
      // Add new item
      const newItem: IAdminCartItemData = {
        ...item,
        subtotal: calculateSubtotal(item.price, item.quantity),
      };
      setCartItems((prev) => [...prev, newItem]);
    }
  };

  const removeItem = (id: number | string): void => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number | string, quantity: number): void => {
    if (quantity < 1) return;
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity, subtotal: calculateSubtotal(item.price, quantity) } : item)));
  };

  const updateItem = (id: number | string, updates: Partial<Omit<IAdminCartItemData, "subtotal">>): void => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          return {
            ...updatedItem,
            subtotal: calculateSubtotal(updatedItem.price, updatedItem.quantity),
          };
        }
        return item;
      }),
    );
  };

  const clearCart = (): void => {
    setCartItems([]);
    setCustomerData(undefined);
  };

  const getTotal = (): number => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getTotalItems = (): number => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const addCustomer = (data?: ICustomerData) => {
    setCustomerData(data);
  };

  const updateStepper = () => {
    if (stepper < 2) {
      setStepper(2);
    } else {
      setStepper(1);
    }
  };

  return (
    <AddTransactionContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        updateItem,
        clearCart,
        getTotal,
        getTotalItems,
        addCustomer,
        customerData,
        stepper,
        updateStepper,
      }}
    >
      {children}
    </AddTransactionContext.Provider>
  );
}
export function useAdminManualTransaction() {
  const context = useContext(AddTransactionContext);
  if (!context) {
    throw new Error("useAdminManualTransaction must be used within AddTransactionProvider");
  }
  return context;
}
