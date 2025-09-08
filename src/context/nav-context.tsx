"use client";

import type React from "react";

import { createContext, useContext } from "react";

interface NavigationContextType {
  showNav?: boolean;
}

const NavigationContext = createContext<NavigationContextType>({});

export function NavigationProvider({ children, showNav = true }: { children: React.ReactNode; showNav?: boolean }) {
  return <NavigationContext.Provider value={{ showNav }}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  return useContext(NavigationContext);
}
