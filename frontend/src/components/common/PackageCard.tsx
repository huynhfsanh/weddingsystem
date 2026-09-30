import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import type { WeddingPackage } from "@/types";
import { assetUrl, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const PackageCard = ({ item, hrefPrefix = "/packages" }: { item: WeddingPackage; hrefPrefix?: string }) => <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100"><img src={assetUrl(item.imageUrl || item.images?.[0]?.url || "")} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />{item.isFeatured && <span className="absolute left-3 top-3 rounded-full bg-champagne-500 px-3 py-1 text-xs font-bold text-ink">Nổi bật</span>}</div>
  <div className="p-5"><div className="text-xs font-semibold uppercase text-primary-600">{item.style}</div><h3 className="mt-1 font-display text-xl font-bold text-ink">{item.name}</h3><p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">{item.description}</p><div className="mt-4 flex items-center gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-primary-600" />Từ {item.standardTables} bàn</div><div className="mt-5 flex items-end justify-between"><div><span className="text-xs text-slate-500">Giá tham khảo</span><div className="text-lg font-bold text-primary-700">{formatCurrency(item.basePrice)}</div></div><Button asChild size="icon" variant="secondary"><Link to={`${hrefPrefix}/${item.slug}`} aria-label={`Xem ${item.name}`}><ArrowRight className="h-4 w-4" /></Link></Button></div></div>
</article>;
