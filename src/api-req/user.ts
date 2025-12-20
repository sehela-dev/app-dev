import { axiosx } from "@/lib/axiosx";
import { MAIN_AUTH_API_URL } from "@/lib/config";
import { TLogin } from "@/types/auth/user.interface";

export const adminLoginRequest: TLogin = async (data) => {
  const res = await axiosx(false, "", "auth").post(`${MAIN_AUTH_API_URL}/token?grant_type=password`, data);
  return res.data;
};
