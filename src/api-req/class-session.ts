import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TClassSessionCategoryResponse, TCreateNewClassCategory, TDeleteClassCategory, TEditClassCategory } from "@/types/class-category.interface";
import { TCreateSessionData, TEditSessionData, TSessionBookings, TSessionDetailData, TSessionListData } from "@/types/class-sessions.interface";

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

export const editSession: TEditSessionData = async ({ id, data }) => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/classes/sessions/${id}`, data);
  return res.data;
};

export const getSessionDetail: TSessionDetailData = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/classes/sessions/${id}`);
  return res.data;
};

export const getSesionDetailBooking: TSessionBookings = async ({ id, page, limit }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/classes/sessions/${id}/bookings`, {
    params: {
      page,
      page_size: limit,
    },
  });
  return res.data;
};

export const getClassCategory: TClassSessionCategoryResponse = async ({ page, limit, search, status, sort_by }) => {
  const res = await axiosx(false).get(`${MAIN_API_URL}/classes`, {
    params: {
      page,
      page_size: limit,
      q: search,
      is_active: status,
      sort_by,
    },
  });
  return res.data;
};

export const createNewClassCategory: TCreateNewClassCategory = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/classes`, data);
  return res.data;
};
export const editClassCategory: TEditClassCategory = async ({ id, data }) => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/classes/${id}`, data);
  return res.data;
};
export const deleteClassCategory: TDeleteClassCategory = async (id) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/classes/${id}`);
  return res.data;
};
export const createNewSession: TCreateSessionData = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/classes/sessions`, data);
  return res.data;
};

export const deleteSession: TSessionDetailData = async (id) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/classes/sessions/${id}`);
  return res.data;
};
