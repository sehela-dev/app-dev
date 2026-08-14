import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { IAdminProfile, TCreateAdmin, TDeactivateAdmin, TGetAdminAuditLogs, TGetAdmins, TUpdateAdmin } from "@/types/admin-management.interface";

export const getAdmins: TGetAdmins = async ({ page, page_size, q, role, is_active }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/admins`, {
    params: {
      page,
      page_size,
      q,
      ...(role ? { role } : null),
      ...(is_active !== undefined ? { is_active } : null),
    },
  });
  return res.data;
};

export const createAdmin: TCreateAdmin = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/admins`, data);
  return res.data;
};

export const updateAdmin: TUpdateAdmin = async ({ id, data }) => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/admin/admins/${id}`, data);
  return res.data;
};

export const deactivateAdmin: TDeactivateAdmin = async ({ id, reason }) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/admin/admins/${id}`, {
    params: reason ? { reason } : undefined,
  });
  return res.data;
};

export const getAdminDetail = async (id: string): Promise<IAdminProfile> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/admins/${id}`);
  return res.data?.data;
};

export const getAdminAuditLogs: TGetAdminAuditLogs = async ({ id, page, page_size, action, start_date, end_date }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/audit-logs/${id}`, {
    params: {
      page,
      page_size,
      ...(action ? { action } : null),
      ...(start_date ? { start_date } : null),
      ...(end_date ? { end_date } : null),
    },
  });
  return res.data;
};