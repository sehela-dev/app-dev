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
  description: string;
  bank_name?: string;
  bank_account_number?: string;
  payment_rules?: IPaymentRule[] | null;
}
export interface IInstructorDetails {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  status: string;
  role?: string;
  is_active?: boolean;
  payment_models: unknown;
  bank_name: string;
  bank_account_number: string;
  description: string;
  payment_rules?: IPaymentRuleResponse[];
  created_at: string;
  updated_at: string;
}

export interface IPaymentRuleResponse {
  session_type: string;
  session_place: string | null;
  payment_model: string;
  model_params: IModelParams;
}

export interface IPaymentRule {
  session_type: string;
  session_place?: string | null;
  payment_model: string;
  model_params: IModelParams;
}

export interface IModelParams {
  percentage?: number;
  min_amount?: number;
  min_threshold_people?: number;
  amount?: number;
  credit_rate?: number;
  non_credit_rate?: number;
  base_amount?: number;
  additional_per_person?: number;
  base_people?: number;
  per_person_amount?: number;
}

export interface IFormValuesAddInstructor extends Omit<ICreateIntructorPayload, "bank_name"> {
  bank_name: {
    label: string;
    value: string;
  };
  regular: IPaymentRuleForm | null;
  reg_online: IPaymentRuleForm | null;
  private: IPaymentRuleForm | null;
  special: IPaymentRuleForm | null;
  payment_model?: string;
}

export interface IPaymentRuleForm {
  payment_model?: string;
  model_params?: IModelParams;
}
export type TCreateInstructor = (data: ICreateIntructorPayload) => Promise<IResponseData<IInstructorData>>;
export type TEditInstructor = ({ data, id }: { data: ICreateIntructorPayload; id: string }) => Promise<IResponseData<IInstructorData>>;
export type TInstructorData = (params: ICommonParams) => Promise<IResponseData<IInstructorData[]>>;
export type TInstructorDetail = (id: string) => Promise<IResponseData<IInstructorDetails>>;
