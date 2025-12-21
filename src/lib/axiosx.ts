import axios from "axios";
import { toast } from "sonner";
import { SECRET_KEY, validationStatus, AUTH_KEY } from "./config";

const jwtPrefix = "Bearer";
export const axiosx = (auth?: boolean, params?: string, type?: string) => {
  const instance = axios.create();

  instance.interceptors.request.use(
    async (config) => {
      if (auth || params) {
        const token = getToken() ?? params;
        if (!token) return config;
        config.headers.Authorization = `${jwtPrefix} ${token}`;
      }
      if (type === "auth") {
        config.headers["apikey"] = AUTH_KEY;
      } else {
        config.headers["x-api-key"] = SECRET_KEY;
      }

      return config;
    },
    (error) => Promise.reject((error.response && error.response.data) || "Something went wrong!"),
  );

  instance.interceptors.response?.use(
    (response) => response,
    async (error) => {
      if (error?.response && error.response.status === 401 && auth) {
        clearToken();
      }
      if (error?.response && error.response.status >= 500) {
        toast.error(validationStatus(error.response.status), {
          id: "error",
          description: error.response.message,
          position: "bottom-center",
        });
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

const getToken = () => {
  const jwt = JSON.parse(window.localStorage.getItem("jwt") ?? "{}");

  return jwt?.access_token;
};

export const clearToken = () => {
  window.localStorage.removeItem("jwt");
  const jwt = JSON.parse(window.localStorage.getItem("jwt") ?? "{}");
  const { user } = jwt;
  const role = user.role;
  toast.error(validationStatus("401" as string), {
    id: "error",
    description: "Session expired! Please login again to continue",
    position: "bottom-center",
  });
  window.location.href = role === "authenticated" ? "/admin-login" : "/auth/login";
};
