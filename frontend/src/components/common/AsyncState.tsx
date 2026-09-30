import { AlertCircle, LoaderCircle } from "lucide-react";

export const LoadingState = ({ label = "Đang tải dữ liệu..." }: { label?: string }) => <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" />{label}</div>;
export const ErrorState = ({ message }: { message: string }) => <div className="flex min-h-32 items-center justify-center gap-2 rounded-md border border-red-100 bg-red-50 p-5 text-sm text-red-700"><AlertCircle className="h-5 w-5" />{message}</div>;
export const EmptyState = ({ message = "Chưa có dữ liệu." }: { message?: string }) => <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">{message}</div>;
