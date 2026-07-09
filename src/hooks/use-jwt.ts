import { useCallback } from "react";
import { removeStorage, useLocalStorage } from "./use-local-storage";
import { ILocalStorageData } from "@/types/auth/user.interface";
import { getRoleStorageKey, setActiveRole } from "@/lib/auth-storage";

const defaultValues: ILocalStorageData = {
  access_token: "",
  expires_in: undefined,
  expires_at: undefined,
  refresh_token: "",
  isAdmin: false,
};

export const useJwtToken = () => {
  const jwtAuth = useLocalStorage<ILocalStorageData>(getRoleStorageKey("user"), defaultValues);

  const setJwtToken = (data: ILocalStorageData) => {
    setActiveRole("user");
    jwtAuth.setState(data);
  };

  const resetJwt = useCallback(() => removeStorage(getRoleStorageKey("user")), []);
  const { access_token, refresh_token, expires_at, profile, isAdmin } = jwtAuth.state;

  return {
    access_token,
    refresh_token,
    expires_at,
    resetJwt,
    setJwtToken,
    jwtAuth,
    profile,
    isAdmin,
    isHydrated: jwtAuth.isHydrated,
  };
};
