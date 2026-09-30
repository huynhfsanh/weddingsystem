import { useQuery } from "@tanstack/react-query";
import { Check, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api, errorMessage } from "@/lib/api";
import type { PackageImage, WeddingPackage } from "@/types";
import { assetUrl, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/common/AsyncState";
import { PackageGallery } from "@/components/media/PackageGallery";

export const PackageDetailPage = () => {
  const { slug } = useParams();
  const query = useQuery({ queryKey: ["package", slug], queryFn: async () => (await api.get<{ data: WeddingPackage }>(`/packages/slug/${slug}`)).data.data });
  if (query.isLoading) return <div className="page-container py-16"><LoadingState /></div>;
  if (query.isError || !query.data) return <div className="page-container py-16"><ErrorState message={errorMessage(query.error)} /></div>;
  const item = query.data;
  const gallery: PackageImage[] = item.images?.length ? item.images : item.imageUrl ? [{ id: "cover", packageId: item.id, url: item.imageUrl, altText: item.name, sortOrder: 0, isCover: true }] : [];
  const selectedCover = gallery.find((image) => image.isCover) || gallery[0];
  const cover = selectedCover ? { ...selectedCover, url: assetUrl(selectedCover.url) } : undefined;
  return <div><section className="relative min-h-[480px] bg-ink"><img src={cover?.url || item.imageUrl} alt={cover?.altText || item.name} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#102d2a]/95 to-[#102d2a]/30" /><div className="page-container relative flex min-h-[480px] items-end py-12 text-white"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase text-champagne-300">{item.style}</p><h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{item.name}</h1><p className="mt-4 max-w-xl leading-7 text-white/80">{item.description}</p><div className="mt-6 text-2xl font-bold text-champagne-300">Từ {formatCurrency(item.basePrice)}</div></div></div></section><section className="page-container py-12"><p className="text-sm font-semibold text-primary-700">KHÔNG GIAN THỰC TẾ</p><h2 className="mt-1 font-display text-3xl font-bold text-ink">Hình ảnh trong gói</h2><p className="mt-2 text-sm text-slate-500">Chạm vào ảnh để xem đầy đủ từng chi tiết trang trí.</p><div className="mt-6"><PackageGallery images={gallery} packageName={item.name} /></div></section><section className="page-container grid gap-10 pb-12 lg:grid-cols-[1fr_360px]"><div><h2 className="font-display text-2xl font-bold">Hạng mục trong gói</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{item.packageItems?.map(({ catalogItem }) => <div key={catalogItem.id} className="flex gap-3 rounded-md border border-slate-200 bg-white p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700"><Check className="h-4 w-4" /></span><div><div className="font-semibold">{catalogItem.name}</div><div className="mt-1 text-sm leading-5 text-slate-500">{catalogItem.description}</div></div></div>)}</div></div><aside className="self-start rounded-lg border border-primary-100 bg-primary-50 p-6"><MapPin className="h-7 w-7 text-primary-700" /><h2 className="mt-4 font-display text-2xl font-bold text-ink">Tùy biến cho ngày vui</h2><p className="mt-3 text-sm leading-6 text-slate-600">Chọn số bàn, món ăn, dịch vụ và vị trí tổ chức. Hệ thống sẽ tính lại chi phí và tiền cọc.</p><Button asChild className="mt-6 w-full"><Link to={`/customer/contracts/new?package=${item.id}`}>Tùy biến gói này</Link></Button></aside></section></div>;
};
