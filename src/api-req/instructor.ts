import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { ICommonParams } from "@/types/general.interface";
import {
  TClassPaymentInstructor,
  TCreateInstructor,
  TEditInstructor,
  TExportInstructorPayment,
  TGenerateMonthlyReport,
  TInstructorData,
  TInstructorDetail,
  TInstructorSessionPaymentDetails,
  TListTeacherReports,
  TPreviewMonthlyReport,
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

// export const exportInstructorPayment: TExportInstructorPayment = async ({ id, start_date, end_date }) => {
//   const res = await axiosx(true).post(`${MAIN_API_URL}/admin/instructors/${id}/payment-export`, { startDate:start_date, endDate:end_date });
//   // const res = await axiosx(true).post(`${MAIN_API_URL}/admin/instructors/${id}/monthly-report`, { start_date, end_date });
//   return res.data;
// };

export const exportInstructorPayment: TExportInstructorPayment = async ({ id, start_date, end_date, group_by }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/instructors/${id}/payment-export`, {
    params: { start_date, end_date, format: "csv", ...(group_by ? { group_by } : null) },
    responseType: "blob",
  });
  return res.data;
};

export const getInstructorPaymentDetail: TInstructorSessionPaymentDetails = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/sessions/${id}/payment-details`);
  return res.data;
};

export const generateMonthlyReport: TGenerateMonthlyReport = async ({ id, year, month, force_regenerate, allow_incomplete }) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/instructors/${id}/monthly-report`, {
    year,
    month,
    ...(typeof force_regenerate === "boolean" ? { force_regenerate } : null),
    ...(typeof allow_incomplete === "boolean" ? { allow_incomplete } : null),
  });
  return res.data;
};

export const previewMonthlyReport: TPreviewMonthlyReport = async ({ id, year, month }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/instructors/${id}/monthly-report`, {
    params: { year, month },
    responseType: "blob",
  });
  return res.data;
};

export const listTeacherReports: TListTeacherReports = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/teacher-reports`, {
    params: {
      ...(params.instructor_id ? { instructor_id: params.instructor_id } : null),
      ...(params.year ? { year: params.year } : null),
      ...(params.month ? { month: params.month } : null),
      page: params.page ?? 1,
      page_size: params.page_size ?? 20,
    },
  });
  return res.data;
};
