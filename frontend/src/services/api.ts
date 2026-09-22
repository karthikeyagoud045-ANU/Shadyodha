import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("drishti.token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("drishti.token");
      localStorage.removeItem("drishti.session");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

/**
 * USE_MOCK:
 * - Defaults to true for standalone preview / zero-backend demo mode.
 * - Set NEXT_PUBLIC_USE_MOCK=false to connect to live backend on port 5001.
 */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
