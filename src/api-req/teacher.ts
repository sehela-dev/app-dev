import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL, type IResponseData, type IPagiantion } from "@/lib/config";
import type {
  ITeacherEarnings,
  ITeacherInvoice,
  ITeacherInvoiceDownload,
  ITeacherSession,
  ITeacherSessionDetail,
} from "@/types/teacher.interface";

export const getTeacherSessions = async (params: {
  scope: "upcoming" | "past";
  page?: number;
  page_size?: number;
}): Promise<IResponseData<ITeacherSession[]> & { pagination: IPagiantion }> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/teacher/sessions`, { params });
  return res.data;
};

export const getTeacherSessionDetail = async (id: string): Promise<IResponseData<ITeacherSessionDetail>> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/teacher/sessions/${id}`);
  return res.data;
};

/** All pages of one scope, capped so a very long history cannot hang the Overview.
 *  shortcut: 10 pages (1000 sessions) per scope, add date filters if a teacher exceeds it. */
export const getAllTeacherSessions = async (
  scope: "upcoming" | "past",
): Promise<ITeacherSession[]> => {
  const all: ITeacherSession[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await getTeacherSessions({ scope, page, page_size: 100 });
    all.push(...res.data);
    if (!res.pagination.has_next) break;
  }
  return all;
};

export const getTeacherEarnings = async (period?: string): Promise<IResponseData<ITeacherEarnings>> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/teacher/earnings`, { params: period ? { period } : undefined });
  return res.data;
};

export const getTeacherInvoices = async (): Promise<IResponseData<ITeacherInvoice[]>> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/teacher/invoices`);
  return res.data;
};

export const getTeacherInvoiceDownload = async (id: string): Promise<IResponseData<ITeacherInvoiceDownload>> => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/teacher/invoices/${id}/download`);
  return res.data;
};
