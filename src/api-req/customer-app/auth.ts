import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
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
