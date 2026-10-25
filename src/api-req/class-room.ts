import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TClasseRoomData, TCreateRoomBlockData, TDeleteRoomBlockData, TRoomBlockListData } from "@/types/class-room.interface";

export const getClassRoom: TClasseRoomData = async ({ page, limit, search, branch }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/rooms`, {
    params: {
      page,
      page_size: limit,
      q: search,
      ...(branch && branch !== "all" ? { branch } : null),
    },
  });
  return res.data;
};

export const getRoomBlocks: TRoomBlockListData = async ({ room_id, start_date, end_date }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/classes/rooms/blocks`, {
    params: {
      ...(room_id ? { room_id } : null),
      ...(start_date ? { start_date } : null),
      ...(end_date ? { end_date } : null),
    },
  });
  return res.data;
};

export const createRoomBlock: TCreateRoomBlockData = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/classes/rooms/blocks`, data);
  return res.data;
};

export const deleteRoomBlock: TDeleteRoomBlockData = async (id) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/classes/rooms/blocks/${id}`);
  return res.data;
};
