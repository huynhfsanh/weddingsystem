import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { ExternalLink, MapPin } from "lucide-react";

export const MapView = ({ latitude, longitude, address }: { latitude?: string | number; longitude?: string | number; address: string }) => {
  const element = useRef<HTMLDivElement>(null);
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng) && Boolean(latitude) && Boolean(longitude);
  useEffect(() => {
    if (!key || !hasCoordinates || !element.current) return;
    let marker: google.maps.Marker | undefined;
    new Loader({ apiKey: key, version: "weekly" }).load().then((googleApi) => {
      if (!element.current) return;
      const position = { lat, lng };
      const map = new googleApi.maps.Map(element.current, { center: position, zoom: 16, mapTypeControl: false, streetViewControl: false });
      marker = new googleApi.maps.Marker({ map, position });
    });
    return () => marker?.setMap(null);
  }, [hasCoordinates, key, lat, lng]);
  const destination = hasCoordinates ? `${lat},${lng}` : address;
  return <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">{key && hasCoordinates ? <div ref={element} className="h-64 w-full" /> : <div className="flex min-h-32 items-center gap-3 p-5 text-sm text-slate-600"><MapPin className="h-6 w-6 shrink-0 text-primary-700" /><span>{address}</span></div>}<a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 border-t border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-primary-700"><ExternalLink className="h-4 w-4" />Mở chỉ đường</a></div>;
};
