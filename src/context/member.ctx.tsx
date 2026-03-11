"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import type { ILocalStorageData, ILocalStorageDataProfile } from "@/types/auth/user.interface";

import { useJwtToken } from "@/hooks";
import { useGetProfile } from "@/hooks/api/queries/customer/profile";

export interface IAuthContextMember {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  user: ILocalStorageData | null;
  login: (data: ILocalStorageData) => void;
  logout: () => void;
  isCompleteProfile?: boolean;
}

const AuthContext = createContext<IAuthContextMember | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ILocalStorageDataProfile | null>(null);
  const { setJwtToken, resetJwt, access_token, isHydrated, refresh_token } = useJwtToken();

  // Check if token is expired

  const login = (data: ILocalStorageData) => {
    setJwtToken(data);
  };

  const logout = () => {
    resetJwt();
    setProfile(null);
  };

  const { data, isLoading } = useGetProfile(Boolean(access_token) && isHydrated);

  useEffect(() => {
    if (data) {
      setProfile({
        email: data?.data?.email,
        name: data?.data?.full_name,
        id: data?.data?.id,
        overview: data?.data?.overview,
        role: "user",
      });
    }
  }, [data]);

  const value: IAuthContextMember = {
    user: !!access_token
      ? {
          access_token,
          refresh_token: refresh_token ?? "",
          profile,
          isAdmin: false,
        }
      : null,
    isAuthReady: isHydrated && (!!access_token ? !isLoading : true),
    login,
    logout,
    isAuthenticated: !!access_token,
    isCompleteProfile: data?.data?.is_profile_complete,
  };

  useEffect(() => {
    if (!access_token) {
      setProfile(null);
    }
  }, [access_token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthMember = (): IAuthContextMember => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthMember must be used within an AuthProvider");
  }
  return context;
};
