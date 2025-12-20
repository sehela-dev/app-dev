import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TClasseRoomData } from "@/types/class-room.interface";

export const getClassRoom: TClasseRoomData = async ({ page, limit, search }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/rooms`, {
    params: {
      page,
      page_size: limit,
      q: search,
    },
  });
  return res.data;
};
