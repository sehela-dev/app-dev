import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getAllTeacherSessions,
  getTeacherEarnings,
  getTeacherInvoiceDownload,
  getTeacherInvoices,
  getTeacherSessionDetail,
  getTeacherSessions,
} from "@/api-req/teacher";

export const useTeacherSessions = (
  scope: "upcoming" | "past",
  page: number,
  pageSize = 20,
) =>
  useQuery({
    queryKey: ["teacher", "sessions", scope, page, pageSize],
    queryFn: () => getTeacherSessions({ scope, page, page_size: pageSize }),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

export const useTeacherSessionDetail = (id: string) =>
  useQuery({
    queryKey: ["teacher", "sessions", id],
    queryFn: () => getTeacherSessionDetail(id),
    enabled: Boolean(id),
    refetchOnWindowFocus: false,
  });

export const useAllTeacherSessions = (scope: "upcoming" | "past") =>
  useQuery({
    queryKey: ["teacher", "sessions", "all", scope],
    queryFn: () => getAllTeacherSessions(scope),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

export const useTeacherEarnings = (period: string) =>
  useQuery({
    queryKey: ["teacher", "earnings", period],
    queryFn: () => getTeacherEarnings(period),
    enabled: Boolean(period),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

export const useTeacherInvoices = () =>
  useQuery({
    queryKey: ["teacher", "invoices"],
    queryFn: getTeacherInvoices,
    refetchOnWindowFocus: false,
  });

export const useTeacherInvoiceDownload = () =>
  useMutation({
    mutationFn: (id: string) => getTeacherInvoiceDownload(id),
  });
