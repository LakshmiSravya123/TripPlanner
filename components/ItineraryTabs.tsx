"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface ItineraryTabsProps {
  itineraries: {
    economic: Array<{ day: number; date: string; activities: string[] }>;
    balanced: Array<{ day: number; date: string; activities: string[] }>;
    luxury: Array<{ day: number; date: string; activities: string[] }>;
  };
  activeTab: "economic" | "balanced" | "luxury";
  onTabChange: (tab: "economic" | "balanced" | "luxury") => void;
}

export default function ItineraryTabs({
  itineraries,
  activeTab,
  onTabChange,
}: ItineraryTabsProps) {
  const tabs = [
    { id: "economic" as const, label: "Economic Plan", color: "bg-green-500" },
    { id: "balanced" as const, label: "Balanced Plan", color: "bg-blue-500" },
    { id: "luxury" as const, label: "Luxury Plan", color: "bg-amber-500" },
  ];

  const activeItinerary = itineraries[activeTab];

  return (
    <Card className="bg-white shadow-2xl border border-gray-100 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          Your Perfect Itinerary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-3 font-semibold transition-all relative ${
                activeTab === tab.id
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.color}`}
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Itinerary Content */}
        <div className="space-y-4">
          {activeItinerary.map((day, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                Day {day.day} - {day.date}
              </h3>
              <ul className="space-y-2">
                {day.activities.map((activity, actIdx) => (
                  <li key={actIdx} className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span className="text-gray-700">{activity}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

