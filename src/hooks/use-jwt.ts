import { useCallback } from "react";
import { removeStorage, useLocalStorage } from "./use-local-storage";
import { ILocalStorageData } from "@/types/auth/user.interface";
import { IProfileResponse } from "@/types/customer-app/auth-customer.interface";

const defaultValues: ILocalStorageData = {
  access_token: "",
  expires_in: undefined,
  expires_at: undefined,
  refresh_token: "",
  admin: null,
  member: null,
  member_user_profile: undefined,
};

export const useJwtToken = () => {
  const jwtAuth = useLocalStorage<ILocalStorageData>("jwt", defaultValues);

  const setJwtToken = (data: ILocalStorageData) => {
    jwtAuth.setState(data);
  };
  const setProfile = (data?: IProfileResponse) => {
    jwtAuth.setField("member_user_profile", data);
  };
  const resetJwt = useCallback(() => removeStorage("jwt"), []);
  const { access_token, refresh_token, expires_at, admin, member, member_user_profile } = jwtAuth.state;

  return {
    access_token,
    refresh_token,
    expires_at,
    resetJwt,
    setJwtToken,
    jwtAuth,
    member,
    admin,
    member_user_profile,
    setProfile,
    isHydrated: jwtAuth.isHydrated,
  };
};
