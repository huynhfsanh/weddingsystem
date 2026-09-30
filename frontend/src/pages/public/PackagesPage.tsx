import { useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, errorMessage } from "@/lib/api";
import type { WeddingPackage } from "@/types";
import { PackageCard } from "@/components/common/PackageCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/AsyncState";

export const PackagesPage = ({ embedded = false }: { embedded?: boolean }) => {
  const [search, setSearch] = useState("");
  const [style, setStyle] = useState("");
  const query = useQuery({ queryKey: ["packages", search, style], queryFn: async () => (await api.get<{ data: WeddingPackage[] }>("/packages", { params: { search: search || undefined, style: style || undefined } })).data.data });
  return <div className={`${embedded ? "page-container py-8 sm:py-10" : "page-container py-12 sm:py-16"}`}><div className="max-w-2xl"><p className="text-sm font-semibold uppercase text-primary-600">Bộ sưu tập</p><h1 className={`mt-2 font-display font-bold text-ink ${embedded ? "text-3xl" : "text-4xl"}`}>Gói cưới trọn vẹn, dễ dàng tùy biến</h1><p className="mt-4 leading-7 text-slate-600">Giá hiển thị là mức tham khảo từ dữ liệu hệ thống. Chi phí cuối cùng được tính lại theo số bàn và dịch vụ bạn chọn.</p></div><div className="mt-8 grid gap-3 border-y border-slate-200 bg-white py-4 sm:grid-cols-[1fr_220px]"><label className="relative"><span className="sr-only">Tìm kiếm</span><Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input className="form-control pl-10" placeholder="Tìm theo tên gói..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><select className="form-control" value={style} onChange={(event) => setStyle(event.target.value)}><option value="">Tất cả phong cách</option><option>Tối giản</option><option>Truyền thống</option><option>Rustic</option><option>Hiện đại</option><option>Sang trọng</option></select></div><div className="mt-8">{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState message={errorMessage(query.error)} /> : !query.data?.length ? <EmptyState message="Không tìm thấy gói cưới phù hợp." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{query.data.map((item) => <PackageCard key={item.id} item={item} hrefPrefix={embedded ? "/customer/packages" : "/packages"} />)}</div>}</div></div>;
};
