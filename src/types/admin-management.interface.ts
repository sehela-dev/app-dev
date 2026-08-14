import { IPagiantion, IResponseData } from "@/lib/config";

export type AdminRole = "admin" | "manager";

export interface IAdminProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email: string | null;
}

export interface ICreateAdminPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: AdminRole;
  reason?: string;
}

export interface IUpdateAdminPayload {
  email?: string;
  password?: string;
  full_name?: string;
  phone?: string;
  role?: AdminRole;
  is_active?: boolean;
  reason?: string;
}

export interface IAdminAuditLog {
  id: string;
  actor_auth_user_id: string;
  actor_profile_id: string;
  actor_name: string;
  action: string;
  target_auth_user_id: string;
  target_email: string;
  target_name: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
}

export interface IAdminListResponse {
  success: boolean;
  data: IAdminProfile[];
  pagination: IPagiantion;
}

export interface IAuditLogResponse {
  success: boolean;
  data: IAdminAuditLog[];
  pagination: IPagiantion;
}

export interface IAdminListParams {
  page?: number;
  page_size?: number;
  q?: string;
  role?: AdminRole;
  is_active?: boolean;
}

export interface IAuditLogParams {
  id?: string;
  page?: number;
  page_size?: number;
  action?: string;
  actor_id?: string;
  target_id?: string;
  start_date?: string;
  end_date?: string;
}

export type TGetAdmins = (params: IAdminListParams) => Promise<IAdminListResponse>;
export type TCreateAdmin = (data: ICreateAdminPayload) => Promise<IResponseData<{ user: { id: string; email: string }; profile: IAdminProfile }>>;
export type TUpdateAdmin = (data: { id: string; data: IUpdateAdminPayload }) => Promise<
  IResponseData<{
    profile: IAdminProfile;
    email: string | null;
    email_updated: boolean;
    password_updated: boolean;
  }>
>;
export type TDeactivateAdmin = (data: { id: string; reason?: string }) => Promise<IResponseData<{ deactivated: boolean; auth_user_id: string }>>;
export type TGetAdminAuditLogs = (params: IAuditLogParams) => Promise<IAuditLogResponse>;
