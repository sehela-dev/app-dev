import { getRoomBlocks } from "@/api-req";

import { IRoomBlockListParams } from "@/types/class-room.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetRoomBlocks = (params: IRoomBlockListParams) =>
  useQuery({
    queryKey: ["dashboard", "class-room", "blocks", params],
    queryFn: () => getRoomBlocks(params),
    refetchOnWindowFocus: false,
    enabled: !!(params?.start_date || params?.room_id),
  });
