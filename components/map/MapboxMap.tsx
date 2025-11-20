"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MapPin } from "lucide-react";

interface Place {
  name: string;
  coordinates: [number, number];
  type: string;
  description?: string;
  day?: number;
  time?: string;
}

interface MapboxMapProps {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
}

export default function MapboxMap({ places, onPlaceClick }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current || typeof window === "undefined") return;

    // Initialize map - using public demo token (users should add their own)
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoidGVzdCIsImEiOiJjbGV4YW1wbGUifQ.test";

    // Fallback to Leaflet-style map if Mapbox token not available
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN === "pk.eyJ1IjoidGVzdCIsImEiOiJjbGV4YW1wbGUifQ.test") {
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: places[0]?.coordinates || [15.2, 45.1],
      zoom: 10,
      pitch: 45,
      bearing: -17.6,
    });

    map.current.on("load", () => {
      setMapLoaded(true);

      // Add places as markers
      if (map.current) {
        const currentMap = map.current;
        places.forEach((place, index) => {
          const el = document.createElement("div");
          el.className = "custom-marker";
          el.innerHTML = `
            <div class="marker-pulse"></div>
            <div class="marker-pin">
              <span>${index + 1}</span>
            </div>
          `;

          const marker = new mapboxgl.Marker(el)
            .setLngLat(place.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div class="p-3">
                  <h3 class="font-bold text-lg mb-1">${place.name}</h3>
                  ${place.type ? `<p class="text-sm text-gray-600 mb-2">${place.type}</p>` : ""}
                  ${place.description ? `<p class="text-sm text-gray-700">${place.description}</p>` : ""}
                  ${place.day ? `<p class="text-xs text-purple-600 mt-2">Day ${place.day}${place.time ? ` • ${place.time}` : ""}</p>` : ""}
                </div>
              `)
            )
            .addTo(currentMap);

          el.addEventListener("click", () => {
            onPlaceClick?.(place);
          });
        });

        // Draw route lines between places
        if (places.length > 1) {
          const coordinates = places.map((p) => p.coordinates);

          currentMap.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates,
              },
            },
          });

          currentMap.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#8b5cf6",
              "line-width": 4,
              "line-opacity": 0.75,
            },
          });

          // Animate route drawing
          const route = currentMap.getSource("route") as mapboxgl.GeoJSONSource;
          if (route) {
            let progress = 0;
            const animateRoute = () => {
              if (!currentMap || !route) return;
              progress += 0.02;
              if (progress > 1) progress = 1;

              const pointCount = Math.floor(coordinates.length * progress);
              const partialCoordinates = coordinates.slice(0, pointCount + 1);

              route.setData({
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: partialCoordinates,
                },
              });

              if (progress < 1) {
                requestAnimationFrame(animateRoute);
              }
            };
            setTimeout(() => animateRoute(), 500);
          }
        }
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [places, onPlaceClick]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN === "pk.eyJ1IjoidGVzdCIsImEiOiJjbGV4YW1wbGUifQ.test") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold mb-2">Interactive Map</p>
          <p className="text-sm text-gray-600 mb-4">
            Add your Mapbox token to enable 3D interactive maps
          </p>
          <p className="text-xs text-gray-500">
            Set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}

