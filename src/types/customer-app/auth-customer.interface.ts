import { IResponseData } from "@/lib/config";

export interface IAuthLoginPayload {
  email: string;
  password: string;
}

export interface IAuthLoginResponse {
  session: IAuthLoginResponseSession | null;
  user: IAuthLoginResponseUser | null;
  profile: IAuthLoginResponseProfile | null;
}

export interface IAuthLoginResponseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
}

export interface IAuthLoginResponseUser {
  id: string;
  email: string;
  email_confirmed_at: string;
  auth_provider: string;
}

export interface IAuthLoginResponseProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string;
  role: string;
  instagram_username: string;
  photo_url: string;
  tnc_agreed_at: string;
  photo_consent: boolean;
  medical_notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_profile_complete: boolean;
}

export interface IAuthSignUpPaylaod {
  email: string;
  full_name: string;
  password: string;
  date_of_birth: string;
  gender: string;
  instagram_username?: string;
  photo?: File;
  photo_consent: boolean;
  tnc_agreed: boolean;
  phone: string;
}
export interface IAuthSignUpResponse {
  message: string;
  email: string;
  requires_verification: boolean;
}
export interface IAuthVerifyAccountPayload {
  code?: string;
  email: string;
}

export interface IProfileResponse {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string;
  role: string;
  instagram_username: string;
  photo_url: string;
  tnc_agreed_at: string;
  photo_consent: boolean;
  medical_notes: string;
  gender: string;
  date_of_birth: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email: string;
  email_confirmed_at: string;
  auth_provider: string;
  is_profile_complete: boolean;
  overview: IOverviewSession;
}

export interface IOverviewSession {
  credits_balance: number;
  my_sessions: unknown[];
}

export type TAuthCustomerLogin = (data: IAuthLoginPayload) => Promise<IResponseData<IAuthLoginResponse>>;
export type TAuthCustomerSignUp = (data: IAuthSignUpPaylaod | FormData) => Promise<IResponseData<IAuthSignUpResponse>>;
export type TAuthCustomerVerifyAccount = (data: IAuthVerifyAccountPayload) => Promise<IResponseData<{ message: string }>>;
export type TAuthProfileCustomer = (data?: string) => Promise<IResponseData<IProfileResponse>>;
export type TAuthCompleteProfile = (data: IAuthSignUpPaylaod | FormData) => Promise<IResponseData<unknown>>;
