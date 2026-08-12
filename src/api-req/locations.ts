// get locations

import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  TCreateRoomLocation,
  TDeleteRoomLocation,
  TRoomDetailResponseData,
  TRoomResponseData,
  TUpdateRoomLocation,
} from "@/types/room-location.interface";

export const getRoomLocations: TRoomResponseData = async ({ page, limit, search }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/rooms`, {
    params: {
      page,
      page_limit: limit,
      ...(search ? { q: search } : null),
    },
  });
  return res.data;
};

// detail
export const getRoomLocationsDetail: TRoomDetailResponseData = async (data) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/rooms/${data}`);
  return res.data;
};

// create locations
export const createRoomLocation: TCreateRoomLocation = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/rooms`, data);
  return res.data;
};

// edit
export const updateRoomLocations: TUpdateRoomLocation = async ({ id, data }) => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/admin/rooms/${id}`, data);
  return res.data;
};

// delete
export const deleteRoomLocations: TDeleteRoomLocation = async (data) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/admin/rooms/${data}`);
  return res.data;
};
