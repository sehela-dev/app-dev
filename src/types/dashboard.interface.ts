import { IResponseData } from "@/lib/config";

export interface IRevenue {
  all_time_total_idr: number;
  breakdown: IBreakdown;
  monthly_total_idr: string;
  monthly_percentage_change: string;
  previous_month_total_idr: string;
}

export interface IBreakdown {
  class_bookings_idr: number;
  product_sales_idr: number;
  package_purchases_idr: number;
}

export interface IOrders {
  all_time_total: number;
  monthly_total: string;
  monthly_percentage_change: string;
  previous_month_total: string;
}

export interface IMembers {
  all_time_total: number;
  filter_active_only: boolean;
  monthly_new: string;
  monthly_percentage_change: string;
  previous_month_new: string;
}

export interface IOverviewDashboard {
  revenue: IRevenue;
  orders: IOrders;
  members: IMembers;
}

export interface IOverallResult {
  summary: IOverallResultSummary;
  by_class: IOverallResultByClass[];
}

export interface IOverallResultSummary {
  all_time_total_idr: number;
  trends: IOverallResultSummaryTrends;
}
export interface IOverallResultSummaryTrends {
  last_7_days: IOverallResultSummaryTrendsItem;
  last_1_month: IOverallResultSummaryTrendsItem;
  last_6_months: IOverallResultSummaryTrendsItem;
}
export interface IOverallResultSummaryTrendsItem {
  revenue_idr: number;
  previous_period_idr: number;
  percentage_change: number;
}

export interface IOverallResultByClass {
  class_id: string;
  class_name: string;
  all_time_total_idr: number;
  trends: IOverallResultSummaryTrends;
}

export type TOverviewDashboard = () => Promise<IResponseData<IOverviewDashboard>>;
export type TSessionPerformance = () => Promise<IResponseData<IOverallResult>>;
