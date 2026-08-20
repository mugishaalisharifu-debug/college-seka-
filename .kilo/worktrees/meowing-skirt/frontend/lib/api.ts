import axios from "axios";
import { useAuthStore } from "./auth-store";

const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const baseURL = rawBase.replace(/\/+$/, "").endsWith("/api")
  ? rawBase.replace(/\/+$/, "")
  : `${rawBase.replace(/\/+$/, "")}/api`;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  config.headers = config.headers ?? {};
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) {
        useAuthStore.getState().clearSession();
        if (typeof window !== "undefined") {
          window.location.href = "/staff-portal-v1";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
