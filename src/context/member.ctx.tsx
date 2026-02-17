"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { ILocalStorageData, IUser } from "@/types/auth/user.interface";

import { useRouter } from "next/navigation";

import {
  IAuthLoginResponseProfile,
  //  IAuthLoginResponse,
  IProfileResponse,
} from "@/types/customer-app/auth-customer.interface";
// import { useGetProfile } from "@/hooks/api/queries/customer/profile";
import { useJwtToken } from "@/hooks";
import { useGetProfile } from "@/hooks/api/queries/customer/profile";

export interface IAuthContextMember {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  user: ILocalStorageData["member"] | null;
  login: (data: ILocalStorageData) => void;
  logout: () => void;
  profile: IProfileResponse | null;
}

const AuthContextMember = createContext<IAuthContextMember | undefined>(undefined);

export const AuthMemberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { setJwtToken, resetJwt, member, access_token, isHydrated, member_user_profile } = useJwtToken();

  // Check if token is expired

  const isAuthenticated = Boolean(access_token);

  const login = (data: ILocalStorageData) => {
    setJwtToken(data);
    router.push("/");
  };

  const logout = () => {
    resetJwt();
    router.push("/auth/login");
  };

  const value: IAuthContextMember = {
    isAuthenticated,
    isAuthReady: isHydrated,
    user: isAuthenticated ? member : null,
    login,
    logout,
    profile: member_user_profile ?? null,
  };

  return <AuthContextMember.Provider value={value}>{children}</AuthContextMember.Provider>;
};

export const useAuthMember = (): IAuthContextMember => {
  const context = useContext(AuthContextMember);
  if (context === undefined) {
    throw new Error("useAuthMember must be used within an AuthMemberProvider");
  }
  return context;
};
