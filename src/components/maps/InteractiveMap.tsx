import React, { useEffect, useRef, useState } from "react";
import { GOOGLE_MAPS_API_KEY } from "@/lib/config";

interface InteractiveMapProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  lat,
  lng,
  onLocationChange
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps script
    if (!(window as any).google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && lat && lng) {
      const position = { lat, lng };
      const google = (window as any).google;

      if (!mapInstanceRef.current) {
        // Initialize map
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: position,
          zoom: 18,
          mapTypeId: "satellite",
          tilt: 0
        });

        // Initialize marker
        markerRef.current = new google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          draggable: true,
          title: "Drag to adjust location"
        });

        // Listen for marker drag
        markerRef.current.addListener("dragend", () => {
          const newPos = markerRef.current?.getPosition();
          if (newPos) {
            onLocationChange(newPos.lat(), newPos.lng());
          }
        });
      } else {
        // Update existing map and marker
        mapInstanceRef.current.setCenter(position);
        markerRef.current?.setPosition(position);
      }
    }
  }, [isLoaded, lat, lng, onLocationChange]);

  if (!lat || !lng) return null;

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
