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
          position: "top-center",
        });
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

const getToken = () => {
  const admin = JSON.parse(window.localStorage.getItem("admin") ?? "{}");
  const user = JSON.parse(window.localStorage.getItem("user") ?? "{}");
  const instructor = JSON.parse(window.localStorage.getItem("instructor") ?? "{}");
  if (admin?.access_token) return admin?.access_token;
  if (user?.access_token) return user?.access_token;
  if (instructor?.access_token) return instructor?.access_token;
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
  const admin = JSON.parse(window.localStorage.getItem("admin") ?? "{}");
  const user = JSON.parse(window.localStorage.getItem("user") ?? "{}");
  const instructor = JSON.parse(window.localStorage.getItem("instructor") ?? "{}");

  if (admin || instructor) {
    window.localStorage.removeItem("admin");
    window.location.href = "/admin/login";
  } else if (user) {
    window.localStorage.removeItem("user");
    window.location.href = "/auth/login";
  }
  window.location.href = admin ? "/admin-login" : "/auth/login";

  toast.error(validationStatus("401" as string), {
    id: "error",
    description: "Session expired! Please login again to continue",
    position: "top-center",
  });

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
