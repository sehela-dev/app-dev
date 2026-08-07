import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface IRoomItem {
  id: string;
  name: string;
  address: string;
  maps_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface IRoomPayload {
  name: string;
  address: string;
  maps_url: string;
  is_active: boolean;
}

export type TRoomResponseData = (params: ICommonParams) => Promise<IResponseData<IRoomItem[]>>;
export type TRoomDetailResponseData = (id: string) => Promise<IResponseData<IRoomItem>>;
export type TCreateRoomLocation = (paylaod: IRoomPayload) => Promise<IResponseData<IRoomItem>>;
export type TUpdateRoomLocation = ({ id, data }: { id: string; data: IRoomPayload }) => Promise<IResponseData<IRoomItem>>;
export type TDeleteRoomLocation = (id: string) => Promise<IResponseData<unknown>>;
