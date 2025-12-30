import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface ICustomerData {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string;
  role: string;
  instagram_username: string;
  photo_url: string;
  tnc_agreed_at: boolean;
  photo_consent: boolean;
  medical_notes: string;
  created_at: string;
  updated_at: string;
  email: string;
  status: string;
}
export interface ICreateNewCustomerAdminPaylod {
  full_name: string;
  email: string;
  phone: string;
  password?: string;
}

export interface ICustomerUserData {
  id: string;
  email: string;
}
export interface ICustomerProfileData {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string;
  role: string;
  instagram_username: string;
  photo_url: string;
  tnc_agreed_at: string;
  photo_consent: boolean;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ICustomerDetailProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string;
  role: string;
  instagram_username: string;
  photo_url: string;
  tnc_agreed_at: boolean;
  photo_consent: boolean;
  medical_notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface IResponseCustomer {
  user: ICustomerUserData;
  profile: ICustomerProfileData;
}
export interface ICustomerWalletDetail {
  total_credits_balance: number;
  active_packages: IActivePackageCredit[];
  expired_packages: IActivePackageCredit[];
}

export interface IResponseCustomerDetail {
  profile: ICustomerDetailProfile;
  wallet: ICustomerWalletDetail;
}

export interface IActivePackageCredit {
  package_purchase_id: string;
  package_id: string;
  package_name: string;
  package_description: string;
  total_credits: number;
  credits_remaining: number;
  credits_used: number;
  expires_at: string;
  class_ids_restriction: string;
  place_restriction: unknown;
}

export type TCustomerData = (params: ICommonParams) => Promise<IResponseData<ICustomerData[]>>;
export type TCreteateCustomerAdmin = (data: ICreateNewCustomerAdminPaylod) => Promise<IResponseData<IResponseCustomer>>;
export type TCustomerDetail = (id: string) => Promise<IResponseData<IResponseCustomerDetail>>;
