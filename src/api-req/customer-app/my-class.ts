import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TMySession, TMySessionDetail } from "@/types/customer-app/my-session.interface";

export const getMySessions: TMySession = async ({ status, limit, page, search }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/profile/my-sessions`, {
    params: {
      ...(status ? { filter: status } : null),
      page,
      page_size: limit,
      ...(search ? { q: search } : null),
    },
  });
  return res.data;
};

export const getMySessionDetail: TMySessionDetail = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/profile/my-sessions/${id}`);
  return res.data;
};
