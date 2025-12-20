import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface IInstructorData {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
}

export type TInstructorData = (params: ICommonParams) => Promise<IResponseData<IInstructorData[]>>;
