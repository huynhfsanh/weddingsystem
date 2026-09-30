import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import type { PackageImage } from "@/types";
import { Button } from "@/components/ui/button";
import { assetUrl } from "@/lib/utils";

export const PackageGallery = ({ images, packageName }: { images: PackageImage[]; packageName: string }) => {
  const [selected, setSelected] = useState<number | null>(null);
  if (!images.length) return null;
  const visible = images.slice(0, 5);
  const show = (index: number) => setSelected(index);
  const move = (direction: number) => setSelected((current) => current === null ? 0 : (current + direction + images.length) % images.length);

  return <>
    <div className="grid h-[360px] grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-lg sm:h-[460px] md:grid-cols-4">
      {visible.map((image, index) => <button key={image.id} type="button" className={`group relative overflow-hidden bg-slate-100 ${index === 0 ? "col-span-2 row-span-1 md:row-span-2" : ""} ${index > 2 ? "hidden md:block" : ""} ${visible.length === 4 && index === 3 ? "md:col-span-2" : ""}`} onClick={() => show(index)} aria-label={`Xem ảnh ${index + 1} của ${packageName}`}><img src={assetUrl(image.url)} alt={image.altText || packageName} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />{index === visible.length - 1 && images.length > visible.length && <span className="absolute inset-0 grid place-items-center bg-black/50 text-lg font-semibold text-white"><Images className="mr-2 inline h-5 w-5" />+{images.length - visible.length}</span>}</button>)}
    </div>
    <Dialog.Root open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">Thư viện ảnh {packageName}</Dialog.Title>
          {selected !== null && <div className="relative flex h-full w-full max-w-6xl items-center justify-center"><img src={assetUrl(images[selected]!.url)} alt={images[selected]!.altText || packageName} className="max-h-full max-w-full object-contain" /><div className="absolute bottom-0 left-1/2 max-w-[80%] -translate-x-1/2 bg-black/60 px-4 py-2 text-center text-sm text-white">{images[selected]!.altText || packageName} · {selected + 1}/{images.length}</div><Button size="icon" variant="ghost" className="absolute left-0 bg-black/50 text-white hover:bg-black/70 hover:text-white" onClick={() => move(-1)} aria-label="Ảnh trước"><ChevronLeft className="h-6 w-6" /></Button><Button size="icon" variant="ghost" className="absolute right-0 bg-black/50 text-white hover:bg-black/70 hover:text-white" onClick={() => move(1)} aria-label="Ảnh sau"><ChevronRight className="h-6 w-6" /></Button></div>}
          <Dialog.Close asChild><Button size="icon" variant="ghost" className="absolute right-4 top-4 bg-black/50 text-white hover:bg-black/70 hover:text-white" aria-label="Đóng thư viện"><X className="h-6 w-6" /></Button></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
};
