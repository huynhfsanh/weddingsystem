import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarCheck, Check, ExternalLink, LoaderCircle, ReceiptText, UtensilsCrossed } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import type { Contract, MenuCombo, MenuDish, User, WeddingPackage } from "@/types";
import { assetUrl, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/common/AsyncState";
import { MapPicker, type MapValue } from "@/components/maps/MapPicker";
import { DishImage } from "@/components/media/DishImage";

export const CreateContractPage = ({ admin = false }: { admin?: boolean }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [packageId, setPackageId] = useState(params.get("package") || "");
  const [menuComboId, setMenuComboId] = useState("");
  const [tables, setTables] = useState(20);
  const [selectedPackageItems, setSelectedPackageItems] = useState<Record<string, boolean>>({});
  const [replacements, setReplacements] = useState<Record<string, string>>({});
  const [map, setMap] = useState<MapValue>({ address: "" });
  const [customerId, setCustomerId] = useState("");
  const [error, setError] = useState("");

  const packages = useQuery({
    queryKey: ["packages"],
    queryFn: async () => (await api.get<{ data: WeddingPackage[] }>("/packages")).data.data,
    select: (items) => items.map((item) => ({ ...item, imageUrl: assetUrl(item.imageUrl || item.images?.[0]?.url || "") })),
  });
  const menus = useQuery({ queryKey: ["menu-combos"], queryFn: async () => (await api.get<{ data: MenuCombo[] }>("/menu-combos")).data.data });
  const dishes = useQuery({ queryKey: ["menu-dishes"], queryFn: async () => (await api.get<{ data: MenuDish[] }>("/menu-combos/dishes")).data.data });
  const customers = useQuery({ queryKey: ["admin-users", "CUSTOMER"], enabled: admin, queryFn: async () => (await api.get<{ data: User[] }>("/users?role=CUSTOMER")).data.data });

  const chosen = packages.data?.find((item) => item.id === packageId);
  const chosenMenu = menus.data?.find((item) => item.id === menuComboId);
  const packageItems = chosen?.packageItems?.filter((item) => item.catalogItem.isActive) || [];
  const estimate = useMemo(() => {
    if (!chosen) return 0;
    const packageAmount = Number(chosen.basePrice) / chosen.standardTables * tables;
    const removedAmount = packageItems.filter((item) => !selectedPackageItems[item.catalogItem.id]).reduce((sum, item) => sum + Number(item.catalogItem.unitPrice) * item.quantity, 0);
    const menuAmount = chosenMenu ? Number(chosenMenu.pricePerTable) * tables : 0;
    return Math.max(0, Math.round(packageAmount + menuAmount - removedAmount));
  }, [chosen, chosenMenu, tables, packageItems, selectedPackageItems]);

  const mutation = useMutation({
    mutationFn: async (body: unknown) => (await api.post<{ data: Contract }>("/contracts", body)).data.data,
    onSuccess: (data) => navigate(admin ? `/admin/contracts/${data.id}` : `/customer/contracts/${data.id}`),
    onError: (reason) => setError(errorMessage(reason)),
  });
  if (packages.isLoading || menus.isLoading || dishes.isLoading || (admin && customers.isLoading)) return <LoadingState />;
  if (packages.isError || menus.isError || dishes.isError || customers.isError) return <ErrorState message={errorMessage(packages.error || menus.error || dishes.error || customers.error)} />;

  const choosePackage = (item: WeddingPackage) => {
    setPackageId(item.id);
    setTables(item.standardTables);
    setSelectedPackageItems(Object.fromEntries((item.packageItems || []).filter((entry) => entry.catalogItem.isActive).map((entry) => [entry.catalogItem.id, true])));
  };
  const chooseMenu = (id: string) => {
    setMenuComboId(id);
    const combo = menus.data?.find((item) => item.id === id);
    setReplacements(Object.fromEntries((combo?.dishes || []).map((dish) => [dish.id, dish.id])));
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    mutation.mutate({
      customerId: admin ? customerId : undefined,
      packageId,
      menuComboId,
      tableCount: tables,
      setupDate: data.get("setupDate"), eventDate: data.get("eventDate"),
      hostName: data.get("hostName"), hostPhone: data.get("hostPhone"), notes: data.get("notes") || undefined,
      ...map,
      selectedPackageItemIds: Object.entries(selectedPackageItems).filter(([, value]) => value).map(([id]) => id),
      menuSelections: chosenMenu?.dishes.map((dish) => ({ originalDishId: dish.id, selectedDishId: replacements[dish.id] || dish.id })) || [],
    });
  };

  return <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl font-bold text-ink">{admin ? "Tạo hợp đồng cho khách hàng" : "Tạo kế hoạch ngày cưới"}</h1><p className="mt-2 text-sm text-slate-500">Giá, hạng mục, thực đơn và capacity được backend kiểm tra lại khi xác nhận.</p></div>
      <Card><CardHeader><h2 className="font-bold">1. Chọn gói cưới</h2></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2">{packages.data?.map((item) => <button type="button" key={item.id} onClick={() => choosePackage(item)} className={`flex items-center gap-3 rounded-md border p-3 text-left transition ${packageId === item.id ? "border-primary-500 bg-primary-50" : "border-slate-200 hover:border-primary-200"}`}><img src={item.imageUrl} className="h-16 w-20 rounded object-cover" alt="" /><span><span className="block font-semibold">{item.name}</span><span className="text-xs text-slate-500">{formatCurrency(item.basePrice)} · {item.standardTables} bàn</span></span>{packageId === item.id && <Check className="ml-auto h-5 w-5 text-primary-700" />}</button>)}</div><label className="mt-5 block"><span className="field-label">Số bàn</span><input className="form-control max-w-48" type="number" min={1} value={tables} onChange={(event) => setTables(Number(event.target.value))} /></label></CardContent></Card>
      <Card><CardHeader><h2 className="font-bold">2. Hạng mục trong gói</h2></CardHeader><CardContent><p className="mb-4 text-sm text-slate-500">Hạng mục được chọn sẵn. Khi bỏ chọn, giá trị hạng mục sẽ được trừ khỏi tổng tiền.</p>{packageItems.length ? <div className="grid gap-3 sm:grid-cols-2">{packageItems.map(({ catalogItem, quantity, isRequired }) => <label key={catalogItem.id} className={`flex items-center justify-between rounded-md border p-4 ${selectedPackageItems[catalogItem.id] ? "border-primary-300 bg-primary-50" : "border-slate-200 bg-slate-50"}`}><span><span className="block text-sm font-semibold">{catalogItem.name}</span><span className="mt-1 block text-xs text-slate-500">{formatCurrency(Number(catalogItem.unitPrice) * quantity)}{isRequired ? " · Bắt buộc" : ""}</span></span><input type="checkbox" checked={!!selectedPackageItems[catalogItem.id]} disabled={isRequired} onChange={(event) => setSelectedPackageItems({ ...selectedPackageItems, [catalogItem.id]: event.target.checked })} className="h-5 w-5 accent-teal-700" /></label>)}</div> : <p className="text-sm text-amber-700">Gói này chưa được cấu hình hạng mục.</p>}</CardContent></Card>
      <Card><CardHeader><h2 className="flex items-center gap-2 font-bold"><UtensilsCrossed className="h-5 w-5 text-primary-700" />3. Chọn combo thực đơn</h2></CardHeader><CardContent><label><span className="field-label">Combo dành cho mỗi bàn</span><select required value={menuComboId} onChange={(event) => chooseMenu(event.target.value)} className="form-control"><option value="">Chọn combo thực đơn</option>{[...new Set(menus.data?.map((item) => item.groupName))].map((group) => <optgroup key={group} label={group}>{menus.data?.filter((item) => item.groupName === group).map((item) => <option key={item.id} value={item.id}>{item.name}{Number(item.pricePerTable) > 0 ? ` · ${formatCurrency(item.pricePerTable)}/bàn` : " · Đã gồm trong gói"}</option>)}</optgroup>)}</select></label>{chosenMenu && <div className="mt-5 space-y-3"><div className="rounded-md bg-primary-50 p-3 text-sm text-primary-900">Giữ nguyên hoặc thay từng món. Nhấn ảnh để xem món ở kích thước lớn.</div>{chosenMenu.dishes.map((dish, index) => { const selectedDish = dishes.data?.find((item) => item.id === (replacements[dish.id] || dish.id)); const changed = selectedDish?.id !== dish.id; return <div key={dish.id} className="grid gap-3 rounded-md border border-slate-200 p-3 sm:grid-cols-[36px_64px_1fr_1fr]"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary-50 text-sm font-bold text-primary-700">{index + 1}</span><DishImage url={dish.imageUrl} name={dish.name} size="sm" /><div><div className="text-xs text-slate-500">Món trong combo</div><div className="mt-1 text-sm font-semibold">{dish.name}</div>{dish.referenceUrl && <a href={dish.referenceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary-700">Tham khảo <ExternalLink className="h-3 w-3" /></a>}</div><label><span className="field-label">{changed ? "Món thay thế" : "Giữ nguyên món"}</span><select value={replacements[dish.id] || dish.id} onChange={(event) => setReplacements({ ...replacements, [dish.id]: event.target.value })} className="form-control"><option value={dish.id}>Giữ nguyên: {dish.name}</option>{dishes.data?.filter((option) => option.id !== dish.id).map((option) => <option key={option.id} value={option.id}>{option.name} · {option.combo?.groupName}</option>)}</select>{changed && selectedDish && <div className="mt-2 flex items-center gap-2"><DishImage url={selectedDish.imageUrl} name={selectedDish.name} size="sm" /><span className="text-xs font-semibold text-primary-700">{selectedDish.name}</span></div>}</label></div>; })}</div>}</CardContent></Card>
      <Card><CardHeader><h2 className="font-bold">4. Thời gian và gia chủ</h2></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{admin && <label className="sm:col-span-2"><span className="field-label">Khách hàng sở hữu hợp đồng</span><select required value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="form-control"><option value="">Chọn khách hàng</option>{customers.data?.filter((item) => item.status === "ACTIVE").map((item) => <option key={item.id} value={item.id}>{item.fullName} · {item.email}</option>)}</select></label>}<label><span className="field-label">Ngày lắp đặt</span><input required name="setupDate" type="datetime-local" className="form-control" /></label><label><span className="field-label">Ngày tổ chức</span><input required name="eventDate" type="datetime-local" className="form-control" /></label><label><span className="field-label">Tên gia chủ</span><input required name="hostName" className="form-control" /></label><label><span className="field-label">Số điện thoại</span><input required name="hostPhone" className="form-control" /></label><label className="sm:col-span-2"><span className="field-label">Ghi chú</span><textarea name="notes" className="min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm" /></label></CardContent></Card>
      <Card><CardHeader><h2 className="font-bold">5. Địa điểm tổ chức</h2></CardHeader><CardContent><MapPicker value={map} onChange={setMap} /></CardContent></Card>
    </div>
    <aside className="self-start xl:sticky xl:top-28"><Card className="border-primary-200"><CardContent><ReceiptText className="h-7 w-7 text-primary-700" /><h2 className="mt-3 font-display text-xl font-bold">Tóm tắt dự kiến</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Gói cưới</dt><dd className="text-right font-semibold">{chosen?.name || "Chưa chọn"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Thực đơn</dt><dd className="text-right font-semibold">{chosenMenu ? `${chosenMenu.groupName} - ${chosenMenu.name}` : "Chưa chọn"}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Số bàn</dt><dd className="font-semibold">{tables}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Hạng mục</dt><dd className="font-semibold">{Object.values(selectedPackageItems).filter(Boolean).length}/{packageItems.length}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Món thay thế</dt><dd className="font-semibold">{chosenMenu?.dishes.filter((dish) => replacements[dish.id] && replacements[dish.id] !== dish.id).length || 0}</dd></div></dl><div className="mt-5 border-t border-slate-200 pt-5"><div className="text-xs text-slate-500">Tổng tạm tính</div><div className="mt-1 text-2xl font-bold text-primary-700">{formatCurrency(estimate)}</div><div className="mt-2 text-sm text-slate-500">Cọc dự kiến 50%: {formatCurrency(estimate * .5)}</div></div>{error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button className="mt-5 w-full" disabled={!packageId || !menuComboId || (admin && !customerId) || mutation.isPending}><CalendarCheck className="h-4 w-4" />{mutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}Xác nhận hợp đồng</Button></CardContent></Card></aside>
  </form>;
};
