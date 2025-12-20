import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface IClassRoom {
  id: string;
  name: string;
  address: string;
  maps_url: string;
  photos: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TClasseRoomData = (params: ICommonParams) => Promise<IResponseData<IClassRoom[]>>;
