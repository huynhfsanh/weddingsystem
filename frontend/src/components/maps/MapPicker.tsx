import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin } from "lucide-react";

export interface MapValue { address: string; formattedAddress?: string; latitude?: number; longitude?: number; placeId?: string }

export const MapPicker = ({ value, onChange }: { value: MapValue; onChange: (value: MapValue) => void }) => {
  const element = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [message, setMessage] = useState("");
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  valueRef.current = value;
  onChangeRef.current = onChange;
  useEffect(() => {
    if (!key || !element.current || !input.current) return;
    let marker: google.maps.Marker | undefined;
    new Loader({ apiKey: key, version: "weekly", libraries: ["places"] }).load().then((googleApi) => {
      if (!element.current || !input.current) return;
      const current = valueRef.current;
      const position = { lat: current.latitude ?? 21.0285, lng: current.longitude ?? 105.8542 };
      const map = new googleApi.maps.Map(element.current, { center: position, zoom: current.latitude ? 16 : 12, mapTypeControl: false, streetViewControl: false });
      marker = new googleApi.maps.Marker({ map, position, draggable: true });
      const update = (point: google.maps.LatLng) => onChangeRef.current({ ...valueRef.current, latitude: point.lat(), longitude: point.lng() });
      marker.addListener("dragend", () => { const point = marker?.getPosition(); if (point) update(point); });
      map.addListener("click", (event: google.maps.MapMouseEvent) => { if (event.latLng) { marker?.setPosition(event.latLng); update(event.latLng); } });
      const autocomplete = new googleApi.maps.places.Autocomplete(input.current, { componentRestrictions: { country: "vn" }, fields: ["formatted_address", "geometry", "place_id", "name"] });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const point = place.geometry?.location;
        if (!point) return;
        marker?.setPosition(point);
        map.setCenter(point);
        map.setZoom(16);
        onChangeRef.current({
          address: place.formatted_address || place.name || valueRef.current.address,
          formattedAddress: place.formatted_address,
          latitude: point.lat(),
          longitude: point.lng(),
          placeId: place.place_id,
        });
      });
    }).catch(() => setMessage("Không thể tải Google Maps. Bạn vẫn có thể nhập địa chỉ thủ công."));
    return () => { marker?.setMap(null); };
  }, [key]);
  return <div className="space-y-3"><label><span className="field-label">Địa chỉ tổ chức</span><div className="relative"><MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input ref={input} required className="form-control pl-10" value={value.address} onChange={(event) => onChange({ ...value, address: event.target.value, formattedAddress: event.target.value })} placeholder="Số nhà, đường, phường/xã, tỉnh/thành" /></div></label>{key ? <div ref={element} className="h-72 w-full overflow-hidden rounded-md border border-slate-200 bg-slate-100" /> : <div className="rounded-md border border-dashed border-primary-200 bg-primary-50 p-4 text-sm text-primary-800">Google Maps chưa có khóa API. Địa chỉ văn bản vẫn được lưu đầy đủ; bản đồ sẽ tự hoạt động khi bạn thêm `VITE_GOOGLE_MAPS_API_KEY`.</div>}{message && <p className="text-sm text-amber-700">{message}</p>}{value.latitude && <p className="text-xs text-slate-500">Tọa độ: {value.latitude.toFixed(6)}, {value.longitude?.toFixed(6)}</p>}</div>;
};
