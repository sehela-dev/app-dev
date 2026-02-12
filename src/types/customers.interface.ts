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
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  instagram_username?: string;
  photo_url?: string;
  tnc_agreed?: boolean;
  photo_consent?: boolean;
  is_active?: boolean;
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

export interface ICustomerWalletAdmin {
  user: {
    id: string;
    full_name: string;
  };
  session: ISessionWallet;
  eligible_packages: IEligiblePackage[];
  total_eligible_credits: number;
}

export interface ISessionWallet {
  id: string;
  session_name: string;
  type: string;
  place: string;
  price_idr: number;
  status: string;
}
export interface IEligiblePackage {
  package_purchase_id: string;
  package_name: string;
  package_description: string;
  credits_remaining: number;
  total_credits: number;
  expires_at: string;
  session_type_restriction: unknown;
  place_restriction: unknown;
  class_ids_restriction: unknown;
  is_owner: boolean;
  is_shared: boolean;
}

export interface ICustomerActvity {
  booking_id: string;
  session_id: string;
  session_name: string;
  class_name: string;
  instructor_name: string;
  start_datetime: string;
  end_datetime: string;
  type: string;
  place: string;
  location: string;
  booking_status: string;
  attendance_status: string;
  payment_method: string;
  price_idr: number;
  credits_used: number;
  voucher_code: string;
  source_platform: string;
  rescheduled_to_booking_id: string;
  rescheduled_to_session_name: string;
  rescheduled_to_start_datetime: string;
  booked_at: string;
}

export interface ICustomerActivityParams extends ICommonParams {
  id: string;
}

export type TCustomerData = (params: ICommonParams) => Promise<IResponseData<ICustomerData[]>>;
export type TCreteateCustomerAdmin = (data: ICreateNewCustomerAdminPaylod) => Promise<IResponseData<IResponseCustomer>>;
export type TCustomerDetail = (id: string) => Promise<IResponseData<IResponseCustomerDetail>>;
export type TGetUserWallet = ({ user, session }: { user: string; session: string }) => Promise<IResponseData<ICustomerWalletAdmin>>;
export type TEditCustomer = ({ data, id }: { data: ICreateNewCustomerAdminPaylod; id: string }) => Promise<IResponseData<IResponseCustomer>>;
export type TDeleteCustomer = (id: string) => Promise<IResponseData<IResponseCustomer>>;
export type TCustomerActivity = (params: ICustomerActivityParams) => Promise<IResponseData<ICustomerActvity[]>>;
