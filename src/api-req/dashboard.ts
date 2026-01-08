import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TOverviewDashboard, TSessionPerformance } from "@/types/dashboard.interface";

export const getDashboardOverview: TOverviewDashboard = async () => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/dashboard/overview`);
  return res.data;
};

export const getDashboardSessionPerformance: TSessionPerformance = async () => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/dashboard/session-performance`);
  return res.data;
};
