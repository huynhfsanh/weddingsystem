import axios from "axios";

const defaultApiUrl = `${window.location.protocol}//${window.location.hostname}:4000/api`;
const configuredApiUrl = import.meta.env.VITE_API_URL;
const apiBaseUrl = import.meta.env.DEV && (!configuredApiUrl || configuredApiUrl.startsWith("/"))
  ? defaultApiUrl
  : configuredApiUrl || defaultApiUrl;

export const api = axios.create({ baseURL: apiBaseUrl, timeout: 20_000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  if (error.response?.status === 401 && !original?._retry && localStorage.getItem("refreshToken")) {
    original._retry = true;
    try {
      const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: localStorage.getItem("refreshToken") });
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("refreshToken", response.data.data.refreshToken);
      original.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
      return api(original);
    } catch {
      localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken"); localStorage.removeItem("user");
    }
  }
  return Promise.reject(error);
});

export const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) return error.response?.data?.message || "Không thể kết nối tới máy chủ.";
  return error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
};
