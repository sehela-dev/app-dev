/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: IAppMetadata;
  user_metadata: IUserMetadata;
  identities: any[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface IAppMetadata {
  provider: string;
  providers: string[];
}

export interface IUserMetadata {
  full_name: string;
}

export interface IAdminLoginResponse {
  access_token: string;
  token_type?: string;
  expires_in: number;
  expires_at?: number;
  refresh_token: string;
  user?: IUser;
  weak_password?: any;
}

export interface ILocalStorageData {
  access_token: string;
  expires_in?: number;
  expires_at?: number;
  refresh_token: string;
  user?: IUser;
}

export type TLogin = (data: ILoginRequest) => Promise<IAdminLoginResponse>;
