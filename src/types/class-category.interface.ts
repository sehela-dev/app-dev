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
}
export interface ICreateNewCategoryPayload {
  class_name: string;
  class_description: string;
  allow_credit: boolean;
  is_active?: boolean;
}

export type TClassSessionCategoryResponse = (params: ICommonParams) => Promise<IResponseData<IClassSessionCategory[]>>;
export type TCreateNewClassCategory = (data: ICreateNewCategoryPayload) => Promise<IResponseData<IClassSessionCategory>>;
