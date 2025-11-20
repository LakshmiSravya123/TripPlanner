"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSavedTrips, deleteTrip, type SavedTrip } from "@/lib/storage";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyTripsPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [hoveredTrip, setHoveredTrip] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setTrips(getSavedTrips());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this trip?")) {
      deleteTrip(id);
      setTrips(getSavedTrips());
    }
  };

  const handleTripClick = (trip: SavedTrip) => {
    router.push(`/?trip=${trip.id}`);
  };

  if (trips.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-16">
          <Link href="/">
            <Button variant="ghost" className="text-white mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back Home
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <MapPin className="w-16 h-16 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">No trips saved yet</h1>
            <p className="text-purple-200 mb-8">Start planning your magical journey!</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Create Your First Trip
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <Link href="/">
          <Button variant="ghost" className="text-white mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">My Trips ✨</h1>
          <p className="text-purple-200 text-lg">{trips.length} saved {trips.length === 1 ? "trip" : "trips"}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="cursor-pointer"
              onClick={() => handleTripClick(trip)}
            >
              <Card className="bg-white/10 backdrop-blur-xl border-2 border-white/20 overflow-hidden h-full hover:border-purple-400 transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.destination}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDelete(trip.id, e)}
                      className="opacity-80 hover:opacity-100 bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">{trip.destination}</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{trip.travelers} {trip.travelers === 1 ? "Traveler" : "Travelers"}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-gray-400">
                        Saved {new Date(trip.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

