"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import dynamic from "next/dynamic";
import EnhancedDestinationMap from "../EnhancedDestinationMap";

// Dynamically import Mapbox to avoid SSR issues
const MapboxMap = dynamic(() => import("./MapboxMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white font-medium">Loading interactive map...</p>
      </div>
    </div>
  )
});

interface Place {
  name: string;
  coordinates: [number, number];
  type: string;
  description?: string;
  day?: number;
  time?: string;
}

interface InteractiveMapFlowchartProps {
  destination: string;
  places: Place[];
  itinerary?: any;
  onPlaceClick?: (place: Place) => void;
}

export default function InteractiveMapFlowchart({
  destination,
  places,
  itinerary,
  onPlaceClick,
}: InteractiveMapFlowchartProps) {
  const hasMapboxToken = typeof window !== "undefined" && 
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN && 
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN !== "pk.eyJ1IjoidGVzdCIsImEiOiJjbGV4YW1wbGUifQ.test";

  // Fallback to Leaflet if Mapbox not available
  if (!hasMapboxToken || places.length === 0) {
    return (
      <div className="relative w-full h-[800px] rounded-lg overflow-hidden border-2 border-purple-200 shadow-2xl">
        <EnhancedDestinationMap
          destination={destination}
          places={places.map(p => ({
            name: p.name,
            coordinates: p.coordinates,
            type: p.type,
            description: p.description || "",
          }))}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[800px] rounded-lg overflow-hidden border-2 border-purple-200 shadow-2xl">
      <MapboxMap places={places} onPlaceClick={onPlaceClick} />
      
      {/* Map Controls Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10"
      >
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Navigation className="w-4 h-4 text-purple-600" />
          <span className="font-semibold">{destination}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{places.length} places to visit</p>
      </motion.div>
    </div>
  );
}
