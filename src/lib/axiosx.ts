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
        // only clear/session-redirect if a token actually exists
        const token = getToken();
        if (token) {
          clearToken();
        }
      }
      if (error?.response && error.response.status >= 500) {
        toast.error(validationStatus(error.response.status), {
          id: "error",
          description: error.response.message,
          position: "top-center",
        });
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

type AuthRole = "admin" | "user" | "instructor" | null;

const safeParse = (raw: string | null) => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const getAuthRole = (): AuthRole => {
  if (typeof window === "undefined") return null;

  const admin = safeParse(window.localStorage.getItem("admin"));
  if (admin?.access_token) return "admin";

  const instructor = safeParse(window.localStorage.getItem("instructor"));
  if (instructor?.access_token) return "instructor";

  const user = safeParse(window.localStorage.getItem("user"));
  if (user?.access_token) return "user";

  return null;
};

const getToken = () => {
  if (typeof window === "undefined") return null;

  const admin = safeParse(window.localStorage.getItem("admin"));
  if (admin?.access_token) return admin.access_token;

  const instructor = safeParse(window.localStorage.getItem("instructor"));
  if (instructor?.access_token) return instructor.access_token;

  const user = safeParse(window.localStorage.getItem("user"));
  if (user?.access_token) return user.access_token;

  return null;
};

// const getAdminToken = () => {
//   const admin = JSON.parse(window.localStorage.getItem("admin") ?? "{}");
//   return admin?.access_token;
// };

// const getJwtToken = () => {
//   const jwt = JSON.parse(window.localStorage.getItem("jwt") ?? "{}");

//   return jwt?.access_token;
// };

export const clearToken = () => {
  if (typeof window === "undefined") return;

  const role = getAuthRole();

  window.localStorage.removeItem("admin");
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("instructor");

  toast.error(validationStatus("401" as string), {
    id: "error",
    description: "Session expired! Please login again to continue",
    position: "top-center",
  });

  window.location.href = role === "admin" || role === "instructor" ? "/admin-login" : "/auth/login";

  /*  // window.localStorage.removeItem("user");
  // window.localStorage.removeItem("instructor");
  const jwt = JSON.parse(window.localStorage.getItem("jwt") ?? "{}");
  console.log(jwt.isAdmin);
  // const { user } = jwt;
  // const role = user?.role ?? "";
  // toast.error(validationStatus("401" as string), {
  //   id: "error",
  //   description: "Session expired! Please login again to continue",
  //   position: "top-center",
  // });
  // window.location.href = role !== "user" ? "/admin-login" : "/auth/login"; */
};
