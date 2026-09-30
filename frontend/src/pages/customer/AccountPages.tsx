import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthContext";
import type { Contract, User } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/AsyncState";
import { StatusBadge } from "@/components/common/StatusBadge";

export const PaymentsPage = () => {
  const query = useQuery({ queryKey: ["my-contracts"], queryFn: async () => (await api.get<{ data: Contract[] }>("/contracts/me")).data.data });
  if (query.isLoading) return <LoadingState />; if (query.isError) return <ErrorState message={errorMessage(query.error)} />;
  const payments = query.data?.flatMap((contract) => contract.payments.map((payment) => ({ ...payment, contractCode: contract.contractCode }))) || [];
  return <div><h2 className="text-2xl font-bold">Lịch sử thanh toán</h2><p className="mt-1 text-sm text-slate-500">Dữ liệu được đối soát từ backend.</p><Card className="mt-6"><CardContent className="overflow-x-auto p-0">{payments.length ? <table className="data-table"><thead><tr><th>Hợp đồng</th><th>Nội dung</th><th>Số tiền</th><th>Trạng thái</th></tr></thead><tbody>{payments.map((item) => <tr key={item.id}><td className="font-semibold">{item.contractCode}</td><td className="font-mono text-xs">{item.transferContent}</td><td>{formatCurrency(item.expectedAmount)}</td><td><StatusBadge status={item.status} /></td></tr>)}</tbody></table> : <EmptyState message="Chưa có giao dịch." />}</CardContent></Card></div>;
};

export const ProfilePage = () => {
  const { user, updateUser } = useAuth(); const [message, setMessage] = useState("");
  const mutation = useMutation({ mutationFn: async (body: unknown) => (await api.patch<{ data: User }>("/auth/profile", body)).data.data, onSuccess: (data) => { updateUser(data); setMessage("Đã cập nhật hồ sơ."); }, onError: (reason) => setMessage(errorMessage(reason)) });
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); mutation.mutate({ fullName: data.get("fullName"), phone: data.get("phone") }); };
  return <div className="max-w-2xl"><h2 className="text-2xl font-bold">Hồ sơ cá nhân</h2><Card className="mt-6"><CardContent><form className="space-y-4" onSubmit={submit}><label><span className="field-label">Họ và tên</span><input name="fullName" defaultValue={user?.fullName} className="form-control" /></label><label><span className="field-label">Email</span><input value={user?.email} disabled className="form-control bg-slate-50" /></label><label><span className="field-label">Số điện thoại</span><input name="phone" defaultValue={user?.phone} className="form-control" /></label>{message && <p className="text-sm text-primary-700">{message}</p>}<Button disabled={mutation.isPending}>Lưu thay đổi</Button></form></CardContent></Card></div>;
};

interface Notification { id: string; title: string; message: string; type: string; link?: string; readAt?: string; createdAt: string }
export const NotificationsPage = () => {
  const client = useQueryClient(); const query = useQuery({ queryKey: ["notifications"], queryFn: async () => (await api.get<{ data: Notification[] }>("/notifications")).data.data });
  const markAll = useMutation({ mutationFn: () => api.patch("/notifications/read-all"), onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }) });
  return <div><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold">Thông báo</h2><p className="mt-1 text-sm text-slate-500">Cập nhật hợp đồng, thanh toán và công việc.</p></div><Button variant="secondary" onClick={() => markAll.mutate()}><CheckCheck className="h-4 w-4" />Đánh dấu đã đọc</Button></div><div className="mt-6 space-y-3">{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState message={errorMessage(query.error)} /> : !query.data?.length ? <EmptyState message="Chưa có thông báo." /> : query.data.map((item) => <div key={item.id} className={`flex gap-4 rounded-md border p-4 ${item.readAt ? "border-slate-200 bg-white" : "border-primary-200 bg-primary-50"}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-primary-700"><Bell className="h-4 w-4" /></span><div><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{item.message}</p><p className="mt-2 text-xs text-slate-400">{formatDateTime(item.createdAt)}</p></div></div>)}</div></div>;
};
