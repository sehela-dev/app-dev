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

export interface ICreateIntructorPayload {
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
  status?: string;
  bank_name?: string;
  bank_account_number?: string;
}

export interface IInstructorDetails {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  status: string;
  payment_models: unknown;
  bank_name: string;
  bank_account_number: string;
  created_at: string;
  updated_at: string;
}

export type TCreateInstructor = (data: ICreateIntructorPayload) => Promise<IResponseData<IInstructorData>>;
export type TEditInstructor = ({ data, id }: { data: ICreateIntructorPayload; id: string }) => Promise<IResponseData<IInstructorData>>;
export type TInstructorData = (params: ICommonParams) => Promise<IResponseData<IInstructorData[]>>;
export type TInstructorDetail = (id: string) => Promise<IResponseData<IInstructorDetails>>;
