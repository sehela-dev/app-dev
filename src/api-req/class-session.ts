import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  TClassSessionCategoryResponse,
  TCreateNewClassCategory,
  TDeleteClassCategory,
  TDetailClassCategory,
  TEditClassCategory,
} from "@/types/class-category.interface";
import {
  TCreateSessionData,
  TDuplicatePreviewData,
  TDuplicateRangeData,
  TDuplicateSessionData,
  TEditSessionData,
  TPublishBatchData,
  TSessionBookings,
  TSessionDetailData,
  TSessionListData,
  ISessionCancelParams,
  ISessionCancelPreview,
} from "@/types/class-sessions.interface";

export const getSessions: TSessionListData = async ({
  page,
  limit,
  search,
  payment_method,
  status,
  startDate,
  endDate,
  is_credit_only,
  has_photo,
  date,
  branch,
  is_published,
}) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/classes/sessions`, {
    params: {
      page,
      page_size: limit,
      ...(date ? { date } : null),
      ...(startDate ? { start_date: startDate } : null),
      ...(endDate ? { end_date: endDate } : null),
      ...(search ? { q: search } : null),
      ...(payment_method ? { payment_method } : null),
      ...(status ? { status } : null),
      ...(typeof is_credit_only === "boolean" ? { is_credit_only } : null),
      ...(typeof has_photo === "boolean" ? { has_photo } : null),
      ...(branch && branch !== "all" ? { branch } : null),
      ...(typeof is_published === "boolean" ? { is_published } : null),
    },
  });
  return res.data;
};

// BE caps page_size (100) — page through everything so calendar views never truncate.
export const getAllSessions: TSessionListData = async (params) => {
  const all: Awaited<ReturnType<typeof getSessions>>["data"] = [];
  let page = 1;
  let last = await getSessions({ ...params, page, limit: 100 });
  for (;;) {
    all.push(...last.data);
    if (!last.pagination?.has_next) break;
    page += 1;
    last = await getSessions({ ...params, page, limit: 100 });
  }
  return { ...last, data: all };
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
export const getClassCategoryDetail: TDetailClassCategory = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/classes/${id}`);
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

export const deleteSession = async ({ id, confirm, default_refund_type, cancel_reason, refund_validity_days }: ISessionCancelParams) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/classes/sessions/${id}`, {
    params: {
      ...(confirm ? { confirm: "true" } : null),
      ...(default_refund_type ? { default_refund_type } : null),
      ...(cancel_reason ? { cancel_reason } : null),
      ...(typeof refund_validity_days === "number" ? { refund_validity_days } : null),
    },
  });
  return res.data;
};

export const previewSessionCancel = async ({
  id,
  default_refund_type = "smart",
  cancel_reason,
  refund_validity_days,
}: Omit<ISessionCancelParams, "confirm">): Promise<{ success: boolean; data: ISessionCancelPreview }> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/classes/sessions/${id}/preview`, {
    params: {
      ...(default_refund_type ? { default_refund_type } : null),
      ...(cancel_reason ? { cancel_reason } : null),
      ...(typeof refund_validity_days === "number" ? { refund_validity_days } : null),
    },
  });
  return res.data;
};

export const sendReminderAll = async (data: string) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/classes/sessions/${data}/send-reminder`, data);
  return res.data;
};

export const duplicateSession: TDuplicateSessionData = async ({ id, data }) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/classes/sessions/${id}/duplicate`, data);
  return res.data;
};

export const publishSession: TSessionDetailData = async (id) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/classes/sessions/${id}/publish`, {});
  return res.data;
};

export const unpublishSession: TSessionDetailData = async (id) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/classes/sessions/${id}/unpublish`, {});
  return res.data;
};

export const publishBatch: TPublishBatchData = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/classes/sessions/publish-batch`, data);
  return res.data;
};

export const duplicatePreview: TDuplicatePreviewData = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/classes/sessions/duplicate-preview`, data);
  return res.data;
};

export const duplicateRange: TDuplicateRangeData = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/classes/sessions/duplicate-range`, data);
  return res.data;
};
