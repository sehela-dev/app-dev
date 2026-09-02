import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  TCreteateCustomerAdmin,
  TCustomerActivity,
  TCustomerActivityExport,
  TCustomerData,
  TCustomerDetail,
  TCustomerTrx,
  TDeleteCustomer,
  TEditCustomer,
  TGetUserWallet,
  TGetHistoricalPackagePurchases,
  TResendRegistrationEmail,
} from "@/types/customers.interface";

export const getCustomers: TCustomerData = async ({ page, limit, status, search }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/students`, {
    params: {
      page,
      page_size: limit,
      ...(status !== "all" ? { is_active: status } : null),
      ...(search ? { q: search } : null),
    },
  });
  return res.data;
};

export const createCustomer: TCreteateCustomerAdmin = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/create-student`, data);
  return res.data;
};
export const editCustomer: TEditCustomer = async ({ data, id }) => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/admin/students/${id}`, data);
  return res.data;
};
export const deleteCustomer: TDeleteCustomer = async (id) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/admin/student/${id}`);
  return res.data;
};

export const getCustomerDetail: TCustomerDetail = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/students/${id}`);
  return res.data;
};

export const getCustomerWallet: TGetUserWallet = async ({ user, session }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/users/${user}/eligible-credits`, {
    params: {
      session_id: session,
    },
  });
  return res.data;
};

export const getCustomerActivity: TCustomerActivity = async ({ id, startDate, endDate, limit, page, sort_by, order, year, month, booking_status, attendance_status, format }) => {
  const isCsv = format === "csv";
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/students/${id}/sessions`, {
    params: {
      ...(isCsv ? null : { page, page_size: limit }),
      ...(year ? { year } : null),
      ...(month ? { month } : null),
      ...(!year && !month && startDate ? { start_date: startDate } : null),
      ...(!year && !month && endDate ? { end_date: endDate } : null),
      ...(booking_status ? { booking_status } : null),
      ...(attendance_status ? { attendance_status } : null),
      ...(sort_by ? { sort_by, order } : null),
      ...(format ? { format } : null),
    },
    ...(isCsv ? { responseType: "blob" as const } : null),
  });
  return res.data;
};

export const exportCustomerActivity: TCustomerActivityExport = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/students/${params.id}/sessions`, {
    params: {
      ...(params.year ? { year: params.year } : null),
      ...(params.month ? { month: params.month } : null),
      ...(!params.year && !params.month && params.startDate ? { start_date: params.startDate } : null),
      ...(!params.year && !params.month && params.endDate ? { end_date: params.endDate } : null),
      ...(params.booking_status ? { booking_status: params.booking_status } : null),
      ...(params.attendance_status ? { attendance_status: params.attendance_status } : null),
      ...(params.sort_by ? { sort_by: params.sort_by, order: (params as unknown as { order?: string }).order } : null),
      format: "csv",
    },
    responseType: "blob",
  });
  return res.data as unknown as Blob;
};

export const getCustomerTrx: TCustomerTrx = async ({ id, page, limit }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/users/${id}/transactions`, {
    params: {
      page,
      page_size: limit,
    },
  });
  return res.data;
};

export const getHistoricalPackagePurchases: TGetHistoricalPackagePurchases = async ({ userId, page, pageSize }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/package-purchases`, {
    params: {
      user_id: userId,
      lifecycle: "historical",
      page,
      page_size: pageSize,
    },
  });
  return res.data;
};

export const resendRegistrationEmail: TResendRegistrationEmail = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/resend-registration-email`, data);
  return res.data;
};
