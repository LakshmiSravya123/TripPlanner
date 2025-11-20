"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getCoordinates } from "@/lib/utils";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface DestinationMapProps {
  destination: string;
}

export default function DestinationMap({ destination }: DestinationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const coords = getCoordinates(destination);

  useEffect(() => {
    setIsClient(true);
    // Import leaflet CSS only on client
    if (typeof window !== "undefined") {
      require("leaflet/dist/leaflet.css");
    }
    
    // Fix for default marker icons
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    }
  }, []);

  if (!coords) {
    return (
      <div className="glass-card rounded-2xl p-8 shadow-xl">
        <p className="text-gray-600 text-center">Map unavailable for this destination</p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold gradient-text">📍 {destination}</h3>
        </div>
        <div className="h-[400px] w-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold gradient-text">📍 {destination}</h3>
      </div>
      <div className="h-[400px] w-full">
        <MapContainer
          center={[coords[0], coords[1]]}
          zoom={11}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coords[0], coords[1]]}>
            <Popup>
              <div className="text-center">
                <strong>{destination}</strong>
                <br />
                <span className="text-sm text-gray-600">Your destination</span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

