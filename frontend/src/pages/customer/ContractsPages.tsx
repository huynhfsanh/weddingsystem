import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Download, LoaderCircle, Plus, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthContext";
import type { Contract } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/AsyncState";
import { MapView } from "@/components/maps/MapView";
import { ContractDocument } from "@/components/contracts/ContractDocument";
import { SignaturePad } from "@/components/contracts/SignaturePad";

export const ContractsPage = () => {
  const query = useQuery({ queryKey: ["my-contracts"], queryFn: async () => (await api.get<{ data: Contract[] }>("/contracts/me")).data.data });
  return <div><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-primary-700">HÀNH TRÌNH NGÀY CƯỚI</p><h1 className="mt-1 font-display text-3xl font-bold text-ink">Hợp đồng của tôi</h1><p className="mt-2 text-sm text-slate-500">Theo dõi từng cột mốc, thực đơn, chữ ký và thanh toán.</p></div><Button asChild><Link to="/customer/contracts/new"><Plus className="h-4 w-4" />Tạo mới</Link></Button></div><div className="mt-8">{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState message={errorMessage(query.error)} /> : !query.data?.length ? <EmptyState message="Bạn chưa có hợp đồng nào." /> : <div className="grid gap-4 lg:grid-cols-2">{query.data.map((item) => <Card key={item.id} className="transition hover:border-primary-200 hover:shadow-soft"><CardContent><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-champagne-700">{item.contractCode}</p><Link to={`/customer/contracts/${item.id}`} className="mt-1 block font-display text-xl font-bold text-ink hover:text-primary-700">{item.weddingPackage.name}</Link><p className="mt-1 text-xs text-slate-500">{item.menuCombo ? `${item.menuCombo.groupName} - ${item.menuCombo.name}` : "Chưa chọn thực đơn"}</p></div><StatusBadge status={item.status} /></div><div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm"><div><span className="block text-xs text-slate-500">Ngày tổ chức</span><b>{formatDate(item.eventDate)}</b></div><div><span className="block text-xs text-slate-500">Tổng giá trị</span><b>{formatCurrency(item.totalAmount)}</b></div><div className="col-span-2 flex items-center gap-2 text-xs"><ShieldCheck className={`h-4 w-4 ${item.signature ? "text-emerald-600" : "text-amber-600"}`} />{item.signature ? "Đã ký điện tử" : "Chờ chữ ký điện tử"}</div></div></CardContent></Card>)}</div>}</div></div>;
};

export const ContractDetailPage = () => {
  const { id } = useParams();
  const query = useQuery({ queryKey: ["contract", id], queryFn: async () => (await api.get<{ data: Contract }>(`/contracts/${id}`)).data.data });
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState message={errorMessage(query.error)} />;
  const contract = query.data;
  const download = async () => { const response = await api.get(`/contracts/${id}/pdf`, { responseType: "blob" }); const url = URL.createObjectURL(response.data); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${contract.contractCode}.pdf`; anchor.click(); URL.revokeObjectURL(url); };
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-champagne-700">HỢP ĐỒNG ĐIỆN TỬ</p><div className="mt-1 flex items-center gap-3"><h1 className="font-display text-3xl font-bold">{contract.contractCode}</h1><StatusBadge status={contract.status} /></div></div><div className="flex gap-2">{!contract.signature && contract.status === "PENDING_DEPOSIT" && <Button asChild><Link to={`/customer/contracts/${id}/payment`}>Ký và đặt cọc</Link></Button>}<Button variant="secondary" onClick={download}><Download className="h-4 w-4" />Tải PDF</Button></div></div><Card><CardContent className="p-6 sm:p-10"><ContractDocument contract={contract} /></CardContent></Card><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><MapView latitude={contract.latitude} longitude={contract.longitude} address={contract.formattedAddress || contract.address} /><Card><CardHeader><h2 className="font-bold">Thanh toán</h2></CardHeader><CardContent><dl className="space-y-3 text-sm"><div className="flex justify-between"><dt>Tổng tiền</dt><dd className="font-semibold">{formatCurrency(contract.totalAmount)}</dd></div><div className="flex justify-between"><dt>Đặt cọc ({Number(contract.depositRate)}%)</dt><dd className="font-semibold">{formatCurrency(contract.depositAmount)}</dd></div><div className="flex justify-between text-emerald-700"><dt>Đã trả</dt><dd className="font-semibold">{formatCurrency(contract.paidAmount)}</dd></div><div className="flex justify-between border-t pt-3"><dt>Còn lại</dt><dd className="font-bold text-primary-700">{formatCurrency(contract.remainingAmount)}</dd></div></dl></CardContent></Card></div></div>;
};

export const PaymentPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const client = useQueryClient();
  const [signature, setSignature] = useState<Blob | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [signerName, setSignerName] = useState(user?.fullName || "");
  const [message, setMessage] = useState("");
  const query = useQuery({ queryKey: ["contract", id], queryFn: async () => (await api.get<{ data: Contract }>(`/contracts/${id}`)).data.data });
  const config = useQuery({ queryKey: ["public-config"], queryFn: async () => (await api.get<{ data: { payment: { accountNumber?: string; accountName?: string; bankName?: string }; integrations: { payos?: boolean } } }>("/config/public")).data.data });
  const sign = useMutation({ mutationFn: async () => { if (!signature) throw new Error("Vui lòng ký tên trong khung chữ ký."); const form = new FormData(); form.append("signature", signature, "signature.png"); form.append("signerName", signerName); form.append("agreed", String(agreed)); return api.post(`/contracts/${id}/signature`, form); }, onSuccess: () => { client.invalidateQueries({ queryKey: ["contract", id] }); client.invalidateQueries({ queryKey: ["my-contracts"] }); setMessage(""); }, onError: (reason) => setMessage(errorMessage(reason)) });
  const checkout = useMutation({
    mutationFn: async (paymentId: string) => (await api.post<{ data: { checkoutUrl: string } }>(`/payments/${paymentId}/payos-link`)).data.data,
    onSuccess: (data) => { window.location.assign(data.checkoutUrl); },
    onError: (reason) => setMessage(errorMessage(reason)),
  });
  const syncPayos = useMutation({
    mutationFn: async (paymentId: string) => (await api.post<{ synchronized: boolean; message?: string }>(`/payments/${paymentId}/payos-sync`)).data,
    onSuccess: (data) => {
      client.invalidateQueries({ queryKey: ["contract", id] });
      client.invalidateQueries({ queryKey: ["my-contracts"] });
      setMessage(data.synchronized ? "Thanh toán đã được đồng bộ thành công." : "payOS chưa ghi nhận giao dịch. Vui lòng kiểm tra lại sau ít phút.");
    },
    onError: (reason) => setMessage(errorMessage(reason)),
  });
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState message={errorMessage(query.error)} />;
  const contract = query.data;
  const payment = contract.payments?.find((item) => item.type === "DEPOSIT" && ["PENDING", "PARTIAL"].includes(item.status)) || contract.payments?.[0];
  const bank = config.data?.payment;
  const submitSignature = (event: FormEvent) => { event.preventDefault(); sign.mutate(); };

  if (!contract.signature) return <div className="space-y-6"><div><p className="text-sm font-semibold text-primary-700">BƯỚC 1/2</p><h1 className="mt-1 font-display text-3xl font-bold">Ký hợp đồng điện tử</h1><p className="mt-2 text-sm text-slate-500">Bạn cần ký hợp đồng trước khi xem thông tin chuyển khoản đặt cọc.</p></div><Card><CardContent className="max-h-[560px] overflow-y-auto p-5 sm:p-8"><ContractDocument contract={contract} /></CardContent></Card><Card><CardContent><form onSubmit={submitSignature} className="space-y-4"><label><span className="field-label">Họ tên người ký</span><input required minLength={2} value={signerName} onChange={(event) => setSignerName(event.target.value)} className="form-control" /></label><SignaturePad onChange={setSignature} /><label className="flex items-start gap-3 rounded-md bg-primary-50 p-4 text-sm text-primary-900"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 accent-teal-700" /><span>Tôi đã đọc, hiểu và đồng ý với toàn bộ hợp đồng, phụ lục dịch vụ, thực đơn và chính sách đặt cọc 50%. Tôi xác nhận chữ ký điện tử này là của tôi.</span></label>{message && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{message}</p>}<Button disabled={!agreed || !signature || !signerName.trim() || sign.isPending}>{sign.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}Ký và tiếp tục thanh toán</Button></form></CardContent></Card></div>;

  return <div className="mx-auto max-w-2xl"><p className="text-sm font-semibold text-primary-700">BƯỚC 2/2</p><h1 className="mt-1 font-display text-3xl font-bold">Thanh toán đặt cọc</h1><div className="mt-4 flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-5 w-5" />Hợp đồng đã được ký điện tử bởi {contract.signature.signerName}</div><Card className="mt-6"><CardContent className="space-y-5"><div className="rounded-md bg-primary-50 p-4 text-sm text-primary-900"><b>Quan trọng:</b> nhập đúng nội dung chuyển khoản để hệ thống đối soát tự động.</div>{payment && config.data?.integrations.payos && ["PENDING", "PARTIAL"].includes(payment.status) && <div className="rounded-md border border-primary-200 bg-white p-4"><p className="text-sm font-semibold text-ink">Thanh toán trực tuyến qua payOS</p><p className="mt-1 text-xs text-slate-500">Hệ thống mở trang thanh toán bảo mật và tự động xác nhận khi giao dịch thành công.</p><div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><Button disabled={checkout.isPending} onClick={() => checkout.mutate(payment.id)}>{checkout.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}Thanh toán {formatCurrency(Number(payment.expectedAmount) - Number(payment.receivedAmount))}</Button><Button variant="secondary" disabled={syncPayos.isPending} onClick={() => syncPayos.mutate(payment.id)}>{syncPayos.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Kiểm tra trạng thái</Button></div></div>}{message && <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}{bank?.accountNumber && <dl className="grid gap-3 rounded-md border border-slate-200 p-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Ngân hàng</dt><dd className="font-semibold">{bank.bankName}</dd></div><div><dt className="text-slate-500">Chủ tài khoản</dt><dd className="font-semibold">{bank.accountName}</dd></div><div className="sm:col-span-2"><dt className="text-slate-500">Số tài khoản</dt><dd className="font-mono text-lg font-bold text-primary-700">{bank.accountNumber}</dd></div></dl>}{payment ? <dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Số tiền đặt cọc</dt><dd className="mt-1 text-xl font-bold text-primary-700">{formatCurrency(payment.expectedAmount)}</dd></div><div><dt className="text-slate-500">Trạng thái</dt><dd className="mt-1"><StatusBadge status={payment.status} /></dd></div><div className="sm:col-span-2"><dt className="text-slate-500">Nội dung chuyển khoản</dt><dd className="mt-2 rounded-md border border-dashed border-primary-300 bg-white p-3 text-center font-mono text-lg font-bold">{payment.transferContent}</dd></div></dl> : <EmptyState message="Chưa có yêu cầu thanh toán." />}</CardContent></Card></div>;
};
