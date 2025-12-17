import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TClassSessionCategoryResponse, TCreateNewClassCategory } from "@/types/class-category.interface";
import { TSessionListData } from "@/types/class-sessions.interface";

export const getSessions: TSessionListData = async ({ page, limit, search, payment_method, status, startDate, endDate }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/classes/sessions`, {
    params: {
      page,
      page_size: limit,
      ...(startDate ? { start_date: startDate } : null),
      ...(endDate ? { end_date: endDate } : null),
      ...(search ? { q: search } : null),
      ...(payment_method ? { payment_method } : null),
      ...(status ? { status } : null),
      // ...(status ? { status } : null),
    },
  });
  return res.data;
};

export const getClassCategory: TClassSessionCategoryResponse = async ({ page, limit, search }) => {
  const res = await axiosx(false).get(`${MAIN_API_URL}/classes`, {
    params: {
      page,
      page_size: limit,
      search,
    },
  });
  return res.data;
};

export const createNewClassCategory: TCreateNewClassCategory = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/classes`, data);
  return res.data;
};
