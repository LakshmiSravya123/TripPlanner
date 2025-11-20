"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getCoordinates, geocodeDestination } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Info, Clock, Star } from "lucide-react";

// Dynamically import map components
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

interface Place {
  name: string;
  description: string;
  type?: string;
  coordinates?: [number, number];
}

interface EnhancedDestinationMapProps {
  destination: string;
  places?: Place[];
  description?: string;
}

export default function EnhancedDestinationMap({ destination, places, description }: EnhancedDestinationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [coords, setCoords] = useState<[number, number] | null>(getCoordinates(destination));
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      require("leaflet/dist/leaflet.css");
    }
    
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    }

    // If coordinates not found, try geocoding
    if (!coords && !isGeocoding) {
      setIsGeocoding(true);
      geocodeDestination(destination)
        .then((geocodedCoords) => {
          if (geocodedCoords) {
            setCoords(geocodedCoords);
          }
          setIsGeocoding(false);
        })
        .catch(() => {
          setIsGeocoding(false);
        });
    }
  }, [destination]);

  if (!coords) {
    return (
      <Card className="glass-card rounded-2xl p-8 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            {destination}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGeocoding ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600 text-center">Finding location...</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Map unavailable for "{destination}"</p>
              <p className="text-sm text-gray-500">Unable to find coordinates for this destination</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!isClient) {
    return (
      <Card className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            Explore {destination}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create markers for places if coordinates are available
  const placeMarkers = places?.filter(p => p.coordinates) || [];

  // Create custom numbered icon
  const createNumberedIcon = (number: number) => {
    if (typeof window === "undefined") return undefined;
    
    const L = require("leaflet");
    return L.divIcon({
      className: "custom-numbered-marker",
      html: `<div style="
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${number}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          Explore {destination}
        </CardTitle>
        {description && (
          <p className="text-gray-600 mt-2 text-sm leading-relaxed">{description}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Map */}
          <div className="lg:col-span-2 h-[500px] relative bg-gray-100 rounded-l-lg overflow-hidden" style={{ zIndex: 1 }}>
            <MapContainer
              center={[coords[0], coords[1]]}
              zoom={11}
              style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Main destination marker */}
              <Marker position={[coords[0], coords[1]]}>
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-lg mb-2">{destination}</h3>
                    {description && (
                      <p className="text-sm text-gray-600 mb-2">{description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Your destination</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Place markers with numbers */}
              {placeMarkers.map((place, idx) => {
                const icon = createNumberedIcon(idx + 1);
                return (
                  <Marker key={idx} position={place.coordinates!} icon={icon}>
                    <Popup>
                      <div className="min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {idx + 1}
                          </div>
                          <h3 className="font-bold text-base">{place.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{place.description}</p>
                        {place.type && (
                          <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                            {place.type}
                          </span>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Places Sidebar */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 overflow-y-auto max-h-[500px]">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-purple-600" />
              Places of Interest
            </h3>
            {places && places.length > 0 ? (
              <div className="space-y-3">
                {places.map((place, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPlace(place)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPlace?.name === place.name
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{place.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>
                        {place.type && (
                          <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                            {place.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Info className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Click on the map markers to learn more about places in {destination}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

