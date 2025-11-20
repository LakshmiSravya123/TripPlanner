"use client";

import { motion } from "framer-motion";
import { MapPin, Landmark, Mountain, Camera, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDestinationImages, getUnsplashImage } from "@/lib/images";

interface Place {
  name: string;
  description: string;
  type: "landmark" | "culture" | "nature" | "food";
}

interface PlacesGalleryProps {
  destination: string;
  places?: Place[];
}

const typeIcons = {
  landmark: Landmark,
  culture: Camera,
  nature: Mountain,
  food: MapPin,
};

const typeColors = {
  landmark: "from-amber-500 to-orange-500",
  culture: "from-purple-500 to-pink-500",
  nature: "from-green-500 to-emerald-500",
  food: "from-red-500 to-rose-500",
};

export default function PlacesGallery({ destination, places }: PlacesGalleryProps) {
  const images = getDestinationImages(destination, 4);
  const displayPlaces = places || [];

  return (
    <Card className="bg-white shadow-2xl border border-gray-100 overflow-hidden rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          Must-See Places in {destination}
        </CardTitle>
        <p className="text-gray-600 mt-2 text-sm">Discover the most beautiful and iconic locations</p>
      </CardHeader>
      <CardContent className="p-6">
        {/* Image Gallery - Professional Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={img}
                alt={`${destination} ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-sm font-semibold">{destination}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Places List with Images */}
        {displayPlaces.length > 0 && (
          <div className="space-y-6">
            {displayPlaces.map((place, idx) => {
              const Icon = typeIcons[place.type] || MapPin;
              const colorClass = typeColors[place.type] || "from-gray-500 to-gray-600";
              const placeImage = getUnsplashImage(`${place.name} ${destination}`, 400, 300);

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    {/* Place Image */}
                    <div className="relative h-48 md:h-auto overflow-hidden">
                      <img
                        src={placeImage}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to destination image if place image fails
                          (e.target as HTMLImageElement).src = getUnsplashImage(destination, 400, 300);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-4 left-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Place Info */}
                    <div className="md:col-span-2 p-6 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 mb-2">{place.name}</h3>
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${colorClass} text-white`}>
                            {place.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-4">{place.description}</p>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(place.name + " " + destination)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        Learn more <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

