import axios from "axios";
import { toast } from "sonner";
import { SECRET_KEY, validationStatus, AUTH_KEY, MAIN_API_URL } from "./config";
import { clearAllSessions, clearSession, getActiveRole, getRoleStorageKey, getSession } from "./auth-storage";

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

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config ?? {};

      if (error?.response?.status === 401 && auth && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await refreshAccessToken();

          // persist the new token into localStorage for the current role
          updateAccessToken(newToken);

          // retry the original request with updated Authorization header
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `${jwtPrefix} ${newToken}`,
          };

          return instance(originalRequest);
        } catch (refreshError) {
          // refresh failed → clear local auth and let caller handle redirect/UI
          clearToken();
          return Promise.reject(refreshError);
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

const getToken = () => {
  const role = getActiveRole();
  if (!role) return null;
  const session = getSession<{ access_token?: string }>(role);
  return session?.access_token ?? null;
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

  const role = getActiveRole();
  if (role) {
    clearSession(role);
  } else {
    // fallback: clear everything if we cannot determine active role
    clearAllSessions();
    window.localStorage.removeItem("admin");
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("instructor");
  }

  toast.error(validationStatus("401" as string), {
    id: "error",
    description: "Session expired! Please login again to continue",
    position: "top-center",
  });

  // window.location.href = role === "admin" || role === "instructor" ? "/admin-login" : "/auth/login";

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

const getRefreshToken = () => {
  const role = getActiveRole();
  if (!role) return null;
  const session = getSession<{ refresh_token?: string }>(role);
  return session?.refresh_token ?? null;
};

const updateAccessToken = (newToken: string) => {
  const role = getActiveRole();
  if (!role) return;
  const data = getSession<Record<string, unknown> & { access_token?: string }>(role) ?? {};
  window.localStorage.setItem(getRoleStorageKey(role), JSON.stringify({ ...data, access_token: newToken }));
};
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await axios.post(
    `${MAIN_API_URL}/auth/refresh`,
    {
      refresh_token: refreshToken,
    },
    {
      headers: {
        "x-api-key": SECRET_KEY,
      },
    },
  );

  return res.data.data?.session?.access_token;
};
