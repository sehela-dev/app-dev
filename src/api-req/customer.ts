import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TCreteateCustomerAdmin, TCustomerData, TCustomerDetail } from "@/types/customers.interface";

export const getCustomers: TCustomerData = async ({ page, limit, status, search }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/students`, {
    params: {
      page,
      page_size: limit,
      is_active: status,
      q: search,
    },
  });
  return res.data;
};

export const createCustomer: TCreteateCustomerAdmin = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/create-student`, data);
  return res.data;
};

export const getCustomerDetail: TCustomerDetail = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/students/${id}`);
  return res.data;
};
