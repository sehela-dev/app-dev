import { IResponseData } from "@/lib/config";

export interface ICustomerGuestData {
  user: ICustomerGuestProfile;
  profile: ICustomerGuestProfile;
}

export interface ICustomerGuestProfile {
  id: string;
  email: string;
}

export interface ICustomerGuestProfile {
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
}
export interface IAddNewGuestPayload {
  name: string;
  phone: string;
  email?: string;
  role?: string;
}

export type TAddNewGuest = (data: IAddNewGuestPayload) => Promise<IResponseData<ICustomerGuestData>>;
