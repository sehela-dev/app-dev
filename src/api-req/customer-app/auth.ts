import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL, MAIN_AUTH_API_URL } from "@/lib/config";
import {
  TAuthCompleteProfile,
  TAuthCustomerLogin,
  TAuthCustomerSignUp,
  TAuthCustomerVerifyAccount,
  TAuthProfileCustomer,
} from "@/types/customer-app/auth-customer.interface";

export const userAuthLogin: TAuthCustomerLogin = async (data) => {
  const res = await axiosx(false).post(`${MAIN_API_URL}/auth/login`, data);
  return res.data;
};

export const userAuthSignUp: TAuthCustomerSignUp = async (data) => {
  const res = await axiosx(false).post(`${MAIN_API_URL}/auth/signup`, data);
  return res.data;
};

export const userAuthVerifyEmail: TAuthCustomerVerifyAccount = async (data) => {
  const res = await axiosx(false).post(`${MAIN_API_URL}/auth/verify-email`, data);
  return res.data;
};

export const userAuthResendVerifyEmail: TAuthCustomerVerifyAccount = async (data) => {
  const res = await axiosx(false).post(`${MAIN_API_URL}/auth/resend-verification`, data);
  return res.data;
};

export const userAuthGetProfile: TAuthProfileCustomer = async () => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/profile`);
  return res.data;
};
export const userAuthGetProfileCallback: TAuthProfileCustomer = async (data) => {
  const res = await axiosx(false, data).get(`${MAIN_API_URL}/profile`);
  return res.data;
};

export const userSigInWithGoogle = async () => {
  // const url = `${MAIN_AUTH_API_URL}/authorize?provider=google&redirect_to=https://app-dev.sehelaspace.com/auth/callback`;
  const url = `${MAIN_AUTH_API_URL}/authorize?provider=google&redirect_to=http://localhost:3000/auth/callback`;
  window.location.href = url;
};

export const userCompleteProfile: TAuthCompleteProfile = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/profile/update`, data);
  return res.data;
};
