"use client";

import { motion } from "framer-motion";
import { Sparkles, MapPin, Heart, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InspirationSectionProps {
  destination: string;
  description?: string;
  inspiration?: string[];
}

export default function InspirationSection({ destination, description, inspiration }: InspirationSectionProps) {
  const inspirationPoints = inspiration || [
    `Discover the rich history and culture of ${destination}`,
    `Experience world-class cuisine and local flavors`,
    `Explore stunning architecture and iconic landmarks`,
    `Immerse yourself in the vibrant local atmosphere`,
  ];

  return (
    <Card className="bg-white overflow-hidden shadow-2xl border border-gray-100 rounded-2xl">
      <div className="relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50" />
        <CardContent className="relative p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Why Visit {destination}?
            </h2>
            {description && (
              <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                {description}
              </p>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {inspirationPoints.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  {idx % 4 === 0 && <MapPin className="w-5 h-5 text-white" />}
                  {idx % 4 === 1 && <Heart className="w-5 h-5 text-white" />}
                  {idx % 4 === 2 && <Camera className="w-5 h-5 text-white" />}
                  {idx % 4 === 3 && <Sparkles className="w-5 h-5 text-white" />}
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">{point}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

