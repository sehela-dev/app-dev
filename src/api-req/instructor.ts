import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { ICommonParams } from "@/types/general.interface";
import {
  TClassPaymentInstructor,
  TCreateInstructor,
  TEditInstructor,
  TExportInstructorPayment,
  TInstructorData,
  TInstructorDetail,
} from "@/types/instructor.interface";

export const getInstructor: TInstructorData = async ({ page, limit, search, status }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/instructors`, {
    params: {
      page,
      page_size: limit,
      q: search,
      ...(status ? { status } : null),
    },
  });
  return res.data;
};

export const createInstructor: TCreateInstructor = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/instructors`, data);
  return res.data;
};

export const getInstructorDetail: TInstructorDetail = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/instructors/${id}`);
  return res.data;
};

export const getInstructorPayments: TClassPaymentInstructor = async ({ page, limit, startDate, endDate, id }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/instructors/${id}/payment`, {
    params: {
      page,
      page_limit: limit,
      ...(startDate ? { start_date: startDate } : null),
      ...(endDate ? { end_date: endDate } : null),
    },
  });
  return res.data;
};

export const editInstructor: TEditInstructor = async ({ data, id }) => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/admin/instructors/${id}`, data);
  return res.data;
};

export const deleteInstructor = async (id: string) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/admin/instructors/${id}`);
  return res.data;
};

export const exportInstructorPayment: TExportInstructorPayment = async ({ id, year, month }) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/instructors/${id}/monthly-report`, { year, month });
  return res.data;
};
