import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  TCreteateCustomerAdmin,
  TCustomerActivity,
  TCustomerData,
  TCustomerDetail,
  TCustomerTrx,
  TDeleteCustomer,
  TEditCustomer,
  TGetUserWallet,
} from "@/types/customers.interface";

export const getCustomers: TCustomerData = async ({ page, limit, status, search }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/students`, {
    params: {
      page,
      page_size: limit,
      is_active: status,
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

export const getCustomerActivity: TCustomerActivity = async ({ id, startDate, endDate, limit, page }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/students/${id}/sessions`, {
    params: {
      page,
      page_size: limit,
      ...(startDate ? { start_date: startDate } : null),
      ...(endDate ? { end_date: endDate } : null),
    },
  });
  return res.data;
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
