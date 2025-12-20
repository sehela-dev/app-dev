"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import type { ILocalStorageData } from "@/types/auth/user.interface";
import { useJwtToken } from "@/hooks/use-jwt";
import { useRouter } from "next/navigation";
export interface IAuthContextAdmin {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ILocalStorageData["user"] | null;
  login: (data: ILocalStorageData) => void;
  logout: () => void;
}

const AuthContextAdmin = createContext<IAuthContextAdmin | undefined>(undefined);

export const AuthProviderAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { access_token, setJwtToken, resetJwt, user, expires_at } = useJwtToken();
  const [isLoading, setIsLoading] = useState(true);

  // Check if token is expired
  const isTokenExpired = (expiresAt?: number): boolean => {
    if (!expiresAt) return false;
    return Date.now() >= expiresAt * 1000;
  };

  const isAuthenticated = Boolean(access_token);

  const login = (data: ILocalStorageData) => {
    setJwtToken(data);
    router.push("/admin/dashboard/");
  };

  const logout = () => {
    resetJwt();
    router.push("/auth/login");
  };

  useEffect(() => {
    // Check if token is expired on mount and clear if needed
    // if (access_token && isTokenExpired(Number(expires_at))) {
    //   resetJwt();
    // }

    // Simulate checking auth status (you might want to validate token with server)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [access_token, expires_at, resetJwt]);

  const value: IAuthContextAdmin = {
    isAuthenticated,
    isLoading,
    user: isAuthenticated ? user : undefined,
    login,
    logout,
  };

  return <AuthContextAdmin.Provider value={value}>{children}</AuthContextAdmin.Provider>;
};

export const useAuthAdmin = (): IAuthContextAdmin => {
  const context = useContext(AuthContextAdmin);
  if (context === undefined) {
    throw new Error("useAuthAdmin must be used within an AuthProviderAdmin");
  }
  return context;
};
