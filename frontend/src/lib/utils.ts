import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const formatCurrency = (value: number | string) => `${Number(value).toLocaleString("vi-VN")} đ`;
export const formatDate = (value: string | Date) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));
export const formatDateTime = (value: string | Date) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
export const assetUrl = (value: string) => {
  if (/^https?:\/\//.test(value) || value.startsWith("data:")) return value;
  const configuredApiUrl = import.meta.env.VITE_API_URL;
  const apiBase = import.meta.env.DEV && (!configuredApiUrl || configuredApiUrl.startsWith("/"))
    ? `${window.location.protocol}//${window.location.hostname}:4000/api`
    : configuredApiUrl || `${window.location.protocol}//${window.location.hostname}:4000/api`;
  const origin = apiBase.startsWith("http") ? new URL(apiBase).origin : window.location.origin;
  return `${origin}${value.startsWith("/") ? "" : "/"}${value}`;
};
