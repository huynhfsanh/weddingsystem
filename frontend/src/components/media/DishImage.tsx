import * as Dialog from "@radix-ui/react-dialog";
import { ImageIcon, X } from "lucide-react";
import { assetUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const DishImage = ({ url, name, size = "md" }: { url?: string; name: string; size?: "sm" | "md" }) => {
  if (!url) return <span className={`${size === "sm" ? "h-12 w-12" : "h-20 w-20"} grid shrink-0 place-items-center rounded-md bg-slate-100 text-slate-400`}><ImageIcon className="h-5 w-5" /></span>;
  return <Dialog.Root><Dialog.Trigger asChild><button type="button" className={`${size === "sm" ? "h-12 w-12" : "h-20 w-20"} shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100`} title={`Xem ảnh ${name}`}><img src={assetUrl(url)} alt={name} className="h-full w-full object-cover transition hover:scale-105" /></button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/85" /><Dialog.Content className="fixed inset-0 z-50 grid place-items-center p-5" aria-describedby={undefined}><Dialog.Title className="sr-only">{name}</Dialog.Title><img src={assetUrl(url)} alt={name} className="max-h-[88vh] max-w-[92vw] object-contain" /><div className="absolute bottom-5 rounded bg-black/60 px-4 py-2 text-sm text-white">{name}</div><Dialog.Close asChild><Button size="icon" variant="ghost" className="absolute right-4 top-4 bg-black/50 text-white hover:bg-black/70 hover:text-white"><X className="h-5 w-5" /></Button></Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>;
};
