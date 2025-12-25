export const ENV = (process.env.ENV as string) ?? "dev";

export const MAIN_API_URL = ENV === "dev" ? process.env.API_URL : (process.env.MAIN_API_URL as string);
export const MAIN_AUTH_API_URL = ENV === "dev" ? process.env.DEV_AUTH_API_URL : (process.env.MAIN_AUTH_API_URL as string);
export const SECRET_KEY = ENV === "dev" ? process.env.DEV_SECRET_KEY : (process.env.MAIN_SECRET_KEY as string);
export const AUTH_KEY = ENV === "dev" ? process.env.DEV_SECRET_AUTH_KEY : (process.env.MAIN_SECRET_AUTH_KEY as string);

if (!MAIN_API_URL) {
  throw new Error("MAIN_API_URL  is not defined in environment variables");
}
if (!SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined in environment variables");
}

export const DEFAULT_PASSWORD = "SecurePass123!";
export const AUTH_ACTION = {
  LOGIN: "login",
  REGISTER: "register",
  RESET: "reset_password",
};

export const validationStatus = (data: number | string) => {
  switch (data) {
    case 401:
      return "UNAUTHORIZED";
    case 400:
      return "BAD REQUEST";
    case 403:
      return "FORBIDDEN";
    case 422:
      return "BASIC VALIDATION";
    default:
      return "ERROR";
  }
};

export interface IResponseData<T> {
  statusCode: number;
  message: string;
  data: T;
  pagination?: IPagiantion;
}

export interface IPagiantion {
  page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_prev: boolean;
}
