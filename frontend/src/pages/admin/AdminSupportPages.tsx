import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/AsyncState";

const Head = ({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) => <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{text}</p></div>{action}</div>;

interface Payroll { staff: { id: string; fullName: string; email: string }; totalShifts: number; totalWage: number; assignments: Array<{ id: string; paidAt?: string }> }
export const AdminPayrollPage = () => {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["payroll"], queryFn: async () => (await api.get<{ data: Payroll[] }>("/payroll")).data.data });
  const markPaid = useMutation({ mutationFn: (assignmentIds: string[]) => api.post("/payroll/mark-paid", { assignmentIds }), onSuccess: () => client.invalidateQueries({ queryKey: ["payroll"] }) });
  const download = async () => { const response = await api.get("/payroll/export", { responseType: "blob" }); const link = document.createElement("a"); link.href = URL.createObjectURL(response.data); link.download = "bang-cong.csv"; link.click(); URL.revokeObjectURL(link.href); };
  return <div><Head title="Bảng công và tiền lương" text="Chỉ tổng hợp ca đã nghiệm thu, có check-in và check-out." action={<Button variant="secondary" onClick={download}>Xuất CSV</Button>} /><div className="mt-6">{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState message={errorMessage(query.error)} /> : !query.data?.length ? <EmptyState message="Chưa có ca đủ điều kiện tính lương." /> : <Card><CardContent className="overflow-x-auto p-0"><table className="data-table"><thead><tr><th>Nhân viên</th><th>Email</th><th>Số ca</th><th>Tổng tiền công</th><th>Thao tác</th></tr></thead><tbody>{query.data.map((item) => { const unpaid = item.assignments.filter((assignment) => !assignment.paidAt).map((assignment) => assignment.id); return <tr key={item.staff.id}><td className="font-semibold">{item.staff.fullName}</td><td>{item.staff.email}</td><td>{item.totalShifts}</td><td className="font-semibold text-primary-700">{formatCurrency(item.totalWage)}</td><td><Button size="sm" variant="secondary" disabled={!unpaid.length || markPaid.isPending} onClick={() => markPaid.mutate(unpaid)}>{unpaid.length ? `Đánh dấu đã trả (${unpaid.length})` : "Đã thanh toán"}</Button></td></tr>; })}</tbody></table></CardContent></Card>}</div></div>;
};

interface Audit { id: string; action: string; entityType: string; entityId?: string; userId?: string; createdAt: string; ipAddress?: string }
export const AdminAuditPage = () => {
  const query = useQuery({ queryKey: ["audit"], queryFn: async () => (await api.get<{ data: Audit[] }>("/audit-logs")).data.data });
  return <div><Head title="Nhật ký hệ thống" text="Theo dõi các thao tác quan trọng phục vụ kiểm tra." /><div className="mt-6">{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState message={errorMessage(query.error)} /> : <Card><CardContent className="overflow-x-auto p-0"><table className="data-table"><thead><tr><th>Thời gian</th><th>Hành động</th><th>Đối tượng</th><th>Địa chỉ IP</th></tr></thead><tbody>{query.data?.map((item) => <tr key={item.id}><td>{formatDateTime(item.createdAt)}</td><td className="font-semibold">{item.action}</td><td>{item.entityType} {item.entityId}</td><td>{item.ipAddress || "-"}</td></tr>)}</tbody></table></CardContent></Card>}</div></div>;
};

interface PublicConfig { business: { name: string; phone: string; email: string; address: string }; integrations: Record<string, boolean>; defaults: Record<string, number> }
export const AdminSettingsPage = () => {
  const query = useQuery({ queryKey: ["public-config"], queryFn: async () => (await api.get<{ data: PublicConfig }>("/config/public")).data.data });
  if (query.isLoading) return <LoadingState />; if (query.isError || !query.data) return <ErrorState message={errorMessage(query.error)} />;
  return <div><Head title="Cấu hình hệ thống" text="Chỉ hiển thị trạng thái, tuyệt đối không hiển thị giá trị secret." /><div className="mt-6 grid gap-5 lg:grid-cols-2"><Card><CardContent><h3 className="font-bold">Thông tin doanh nghiệp</h3><dl className="mt-4 space-y-3 text-sm">{Object.entries(query.data.business).map(([key, value]) => <div key={key} className="flex justify-between gap-4"><dt className="text-slate-500">{key}</dt><dd className="text-right font-medium">{value}</dd></div>)}</dl></CardContent></Card><Card><CardContent><h3 className="font-bold">Tích hợp bên ngoài</h3><div className="mt-4 space-y-3">{Object.entries(query.data.integrations).map(([key, enabled]) => <div key={key} className="flex items-center justify-between rounded-md border border-slate-100 p-3"><span className="font-medium capitalize">{key}</span><span className={`flex items-center gap-2 text-sm font-semibold ${enabled ? "text-emerald-700" : "text-amber-700"}`}>{enabled ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}{enabled ? "Đã cấu hình" : "Chưa cấu hình"}</span></div>)}</div></CardContent></Card></div></div>;
};

export const AdminReportsPage = AdminPayrollPage;
