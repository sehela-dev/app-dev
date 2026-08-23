import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  IPublicClassesParams,
  IPublicInstructorsParams,
  IPublicLocationsParams,
  IPublicSessionsParams,
  TGetPublicBookingDetail,
  TGetPublicClasses,
  TGetPublicInstructors,
  TGetPublicLocations,
  TGetPublicSession,
  TGetPublicSessions,
} from "@/types/customer-app/public.interface";

export const getPublicClasses: TGetPublicClasses = async (params) => {
  const { success, data, pagination } = (await axiosx(false).get(`${MAIN_API_URL}/public/classes`, { params })).data;
  return { success, data, pagination };
};

export const getPublicInstructors: TGetPublicInstructors = async (params) => {
  const { success, data, pagination } = (await axiosx(false).get(`${MAIN_API_URL}/public/instructors`, { params })).data;
  return { success, data, pagination };
};

export const getPublicLocations: TGetPublicLocations = async (params) => {
  const { success, data, pagination } = (await axiosx(false).get(`${MAIN_API_URL}/public/locations`, { params })).data;
  return { success, data, pagination };
};

export const getPublicSessions: TGetPublicSessions = async (params) => {
  const { success, data, summary, pagination } = (await axiosx(false).get(`${MAIN_API_URL}/public/sessions`, { params })).data;
  return { success, data, summary, pagination };
};

export const getPublicSession: TGetPublicSession = async (id) => {
  const { data } = (await axiosx(false).get(`${MAIN_API_URL}/public/sessions/${id}`)).data;
  return data;
};

export const getPublicBookingDetail: TGetPublicBookingDetail = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/profile/bookings/${id}`);
  return res.data;
};

export type { IPublicClassesParams, IPublicInstructorsParams, IPublicLocationsParams, IPublicSessionsParams };