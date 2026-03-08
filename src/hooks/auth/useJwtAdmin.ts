import { useCallback } from "react";

import { ILocalStorageData } from "@/types/auth/user.interface";
import { removeStorage, useLocalStorage } from "../use-local-storage";

const defaultValues: ILocalStorageData = {
  access_token: "",
  expires_in: undefined,
  expires_at: undefined,
  refresh_token: "",
};

export const useJwtTAdmin = () => {
  const jwtAuth = useLocalStorage<ILocalStorageData>("admin", defaultValues);

  const setJwtTokenAdmin = (data: ILocalStorageData) => {
    jwtAuth.setState(data);
  };

  const resetJwt = useCallback(() => removeStorage("admin"), []);
  const { access_token, refresh_token, expires_at, profile } = jwtAuth.state;

  return {
    access_token,
    refresh_token,
    expires_at,
    resetJwt,
    setJwtTokenAdmin,
    jwtAuth,
    profile,
    isHydrated: jwtAuth.isHydrated,
  };
};
