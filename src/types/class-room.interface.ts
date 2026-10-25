import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface IClassRoom {
  id: string;
  name: string;
  address: string;
  maps_url: string;
  photos: string;
  branch: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TClasseRoomData = (params: ICommonParams) => Promise<IResponseData<IClassRoom[]>>;

export interface IRoomBlock {
  id: string;
  room_id: string;
  room_name?: string;
  title: string;
  reason?: string | null;
  start_date: string;
  time_start: string;
  time_end: string;
  start_datetime?: string;
  end_datetime?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateRoomBlockPayload {
  room_id: string;
  title: string;
  reason?: string;
  start_date: string;
  time_start: string;
  time_end: string;
}

export interface IRoomBlockListParams {
  room_id?: string;
  start_date?: string;
  end_date?: string;
}

export type TRoomBlockListData = (params: IRoomBlockListParams) => Promise<IResponseData<IRoomBlock[]>>;
export type TCreateRoomBlockData = (data: ICreateRoomBlockPayload) => Promise<IResponseData<IRoomBlock>>;
export type TDeleteRoomBlockData = (id: string) => Promise<IResponseData<IRoomBlock>>;
