import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface IClassSessionCategory {
  id: string;
  class_name: string;
  class_description: string;
  allow_credit: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  cancellation_fee_idr?: number;
}
export interface ICreateNewCategoryPayload {
  class_name: string;
  class_description: string;
  allow_credit: boolean;
  is_active?: boolean;
  cancellation_fee_idr?: number;
}
export interface IEditategoryPayload {
  class_name?: string;
  class_description?: string;
  allow_credit?: boolean;
  is_active?: boolean;
  cancellation_fee_idr?: number;
}

export type TClassSessionCategoryResponse = (params: ICommonParams) => Promise<IResponseData<IClassSessionCategory[]>>;
export type TCreateNewClassCategory = (data: ICreateNewCategoryPayload) => Promise<IResponseData<IClassSessionCategory>>;
export type TEditClassCategory = ({ id, data }: { id: string; data: IEditategoryPayload }) => Promise<IResponseData<IClassSessionCategory>>;
export type TDetailClassCategory = (id: string) => Promise<IResponseData<IClassSessionCategory>>;
export type TDeleteClassCategory = (data: string) => Promise<IResponseData<IClassSessionCategory>>;
