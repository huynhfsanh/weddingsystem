import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SignaturePad = ({ onChange }: { onChange: (blob: Blob | null) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);
  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.strokeStyle = "#134E4A";
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
  }, []);
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current!; canvas.setPointerCapture(event.pointerId); const context = canvas.getContext("2d")!; const current = point(event); context.beginPath(); context.moveTo(current.x, current.y); drawing.current = true; };
  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const context = canvasRef.current!.getContext("2d")!; const current = point(event); context.lineTo(current.x, current.y); context.stroke(); };
  const finish = () => { if (!drawing.current) return; drawing.current = false; setHasSignature(true); canvasRef.current?.toBlob((blob) => onChange(blob), "image/png"); };
  const clear = () => { const canvas = canvasRef.current!; const context = canvas.getContext("2d")!; context.clearRect(0, 0, canvas.width, canvas.height); context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height); context.strokeStyle = "#134E4A"; context.lineWidth = 4; context.lineCap = "round"; setHasSignature(false); onChange(null); };
  return <div><canvas ref={canvasRef} width={900} height={260} className="h-48 w-full touch-none rounded-md border border-dashed border-primary-300 bg-white" onPointerDown={start} onPointerMove={draw} onPointerUp={finish} onPointerCancel={finish} /><div className="mt-2 flex items-center justify-between"><span className="text-xs text-slate-500">Ký bằng chuột hoặc ngón tay trong khung trên.</span><Button type="button" size="sm" variant="ghost" disabled={!hasSignature} onClick={clear}><Eraser className="h-4 w-4" />Xóa chữ ký</Button></div></div>;
};
