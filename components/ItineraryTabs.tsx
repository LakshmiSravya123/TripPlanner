"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, DollarSign, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface ItineraryTabsProps {
  itineraries: {
    economic: Array<{ day: number; date: string; title?: string; activities: any[] }>;
    balanced: Array<{ day: number; date: string; title?: string; activities: any[] }>;
    luxury: Array<{ day: number; date: string; title?: string; activities: any[] }>;
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
                Day {day.day} {day.title && `– ${day.title}`}
                {day.date && <span className="text-sm font-normal text-gray-600 ml-2">({day.date})</span>}
              </h3>
              <ul className="space-y-4">
                {day.activities.map((activity, actIdx) => {
                  // Handle both old format (string) and new format (object)
                  const isObject = typeof activity === "object" && activity !== null;
                  const activityData = isObject ? activity : { title: activity, time: "", location: "", description: "" };
                  
                  return (
                    <li key={actIdx} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-bold text-sm">{actIdx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {activityData.time && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span className="font-semibold">{activityData.time}</span>
                              </div>
                            )}
                            <h4 className="font-bold text-gray-900 text-base">
                              {activityData.title || activityData.name || "Activity"}
                            </h4>
                          </div>
                          {activityData.location && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                              <MapPin className="w-3 h-3 text-purple-500" />
                              <span>{activityData.location}</span>
                            </div>
                          )}
                          {activityData.transportation && (
                            <div className="text-sm text-purple-600 mb-2 font-medium">
                              🚇 {activityData.transportation}
                            </div>
                          )}
                          {activityData.description && (
                            <p className="text-sm text-gray-700 mb-2">{activityData.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-2">
                            {activityData.cost && (
                              <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                                <DollarSign className="w-4 h-4" />
                                <span>{activityData.cost}</span>
                              </div>
                            )}
                            {activityData.tips && (
                              <div className="flex items-start gap-1 text-sm text-amber-600 italic">
                                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{activityData.tips}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

