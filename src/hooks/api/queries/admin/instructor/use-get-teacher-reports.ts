import { listTeacherReports } from "@/api-req/instructor";
import { ITeacherReportsParams } from "@/types/instructor.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetTeacherReports = (params: ITeacherReportsParams, enabled = true) =>
  useQuery({
    queryKey: ["dashboard", "instructor", "teacher-reports", params],
    queryFn: () => listTeacherReports(params),
    refetchOnWindowFocus: false,
    enabled,
  });
