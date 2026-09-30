import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, CheckCircle2, CircleDollarSign, FileText, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthContext";
import type { Contract } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/AsyncState";
import { StatusBadge } from "@/components/common/StatusBadge";

export const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["my-contracts"], queryFn: async () => (await api.get<{ data: Contract[] }>("/contracts/me")).data.data });
  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={errorMessage(query.error)} />;
  const contracts = query.data || [];
  const upcoming = [...contracts].filter((item) => !["CANCELLED", "REJECTED", "COMPLETED"].includes(item.status) && new Date(item.eventDate) >= new Date()).sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate))[0];
  const paid = contracts.reduce((sum, item) => sum + Number(item.paidAmount), 0);
  const remaining = contracts.reduce((sum, item) => sum + Number(item.remainingAmount), 0);
  const firstName = user?.fullName.split(" ").at(-1) || "bạn";

  return <div className="space-y-10">
    <section className="relative min-h-[360px] overflow-hidden rounded-lg bg-primary-900 text-white">
      <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=90" alt="Khoảnh khắc ngày cưới" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b3b36]/95 via-[#0b3b36]/75 to-[#0b3b36]/20" />
      <div className="relative flex min-h-[360px] max-w-3xl flex-col justify-center p-6 sm:p-10">
        <p className="text-sm font-semibold text-champagne-300"><Sparkles className="mr-2 inline h-4 w-4" />Không gian riêng của bạn</p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Chào {firstName}, ngày vui đang đến gần</h1>
        {upcoming ? <div className="mt-5 space-y-2 text-sm text-white/85"><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-champagne-300" />{formatDate(upcoming.eventDate)} · {upcoming.weddingPackage.name}</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-champagne-300" />{upcoming.formattedAddress || upcoming.address}</p></div> : <p className="mt-4 max-w-xl leading-7 text-white/80">Khám phá các gói dịch vụ và bắt đầu lên kế hoạch cho một ngày cưới đúng với câu chuyện của riêng bạn.</p>}
        <div className="mt-7 flex flex-wrap gap-3">{upcoming ? <Button asChild variant="gold"><Link to={`/customer/contracts/${upcoming.id}`}>Xem kế hoạch <ArrowRight className="h-4 w-4" /></Link></Button> : <Button asChild variant="gold"><Link to="/customer/packages">Khám phá gói cưới <ArrowRight className="h-4 w-4" /></Link></Button>}<Button asChild className="border border-white/30 bg-white/10 text-white hover:bg-white/20"><Link to="/customer/chatbot"><MessageCircle className="h-4 w-4" />Nhờ tư vấn</Link></Button></div>
      </div>
    </section>

    <section className="grid divide-y border-y border-primary-100 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div className="flex items-center gap-4 px-5 py-6"><FileText className="h-6 w-6 text-primary-700" /><div><div className="text-2xl font-bold text-ink">{contracts.length}</div><div className="text-xs text-slate-500">Hợp đồng của bạn</div></div></div>
      <div className="flex items-center gap-4 px-5 py-6"><CheckCircle2 className="h-6 w-6 text-emerald-600" /><div><div className="text-2xl font-bold text-ink">{formatCurrency(paid)}</div><div className="text-xs text-slate-500">Đã thanh toán</div></div></div>
      <div className="flex items-center gap-4 px-5 py-6"><CircleDollarSign className="h-6 w-6 text-champagne-700" /><div><div className="text-2xl font-bold text-ink">{formatCurrency(remaining)}</div><div className="text-xs text-slate-500">Còn lại</div></div></div>
    </section>

    <section><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary-700">HÀNH TRÌNH CỦA BẠN</p><h2 className="mt-1 font-display text-2xl font-bold text-ink">Hợp đồng gần đây</h2></div><Link to="/customer/contracts" className="flex items-center gap-2 text-sm font-semibold text-primary-700">Xem tất cả <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-5">{contracts.length ? <div className="grid gap-4 lg:grid-cols-2">{contracts.slice(0, 4).map((item) => <Card key={item.id} className="transition hover:border-primary-200 hover:shadow-soft"><CardContent><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-champagne-700">{item.contractCode}</p><Link to={`/customer/contracts/${item.id}`} className="mt-1 block font-display text-xl font-bold text-ink hover:text-primary-700">{item.weddingPackage.name}</Link></div><StatusBadge status={item.status} /></div><div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary-600" />{formatDate(item.eventDate)}</span><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-600" />{item.address}</span></div></CardContent></Card>)}</div> : <EmptyState message="Bạn chưa có hợp đồng. Hãy chọn một gói cưới để bắt đầu." />}</div></section>
  </div>;
};
