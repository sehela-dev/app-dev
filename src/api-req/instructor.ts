import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { ICommonParams } from "@/types/general.interface";
import { TCreateInstructor, TEditInstructor, TInstructorData, TInstructorDetail } from "@/types/instructor.interface";

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

export const getInstructorPayments = async ({ page, limit, startDate, endDate, id }: ICommonParams) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/instructors/${id}/payment`, {
    params: {
      page,
      page_limit: limit,
      start_date: startDate,
      end_date: endDate,
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
