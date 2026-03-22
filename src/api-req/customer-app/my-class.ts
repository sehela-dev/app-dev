import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TMySession } from "@/types/customer-app/my-session.interface";

export const getMySessions: TMySession = async ({ status, limit, page }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/profile/my-sessions`, {
    params: {
      ...(status ? { filter: status } : null),
      page,
      page_size: limit,
    },
  });
  return res.data;
};
