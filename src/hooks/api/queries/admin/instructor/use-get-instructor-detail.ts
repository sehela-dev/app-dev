import { getInstructorDetail } from "@/api-req";

import { useQuery } from "@tanstack/react-query";

export const useGetInstructorDetail = (params: string) =>
  useQuery({
    queryKey: ["dashboard", "instructors", "instructor-detail", params],
    queryFn: () => getInstructorDetail(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
