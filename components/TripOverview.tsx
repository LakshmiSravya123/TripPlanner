"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Hotel, MapPin, Calendar, Users, DollarSign, Ticket, Lightbulb } from "lucide-react";

interface TripOverviewProps {
  destination: string;
  dates: { start: string; end: string };
  travelers: number;
  flights?: any;
  hotels?: any;
  costs?: any;
  description?: string;
  overview?: {
    budget?: {
      accommodation?: string;
      food?: string;
      transport?: string;
      activities?: string;
      total?: string;
    };
    transportPass?: string;
    practicalInfo?: string[];
  };
  tips?: string[];
}

export default function TripOverview({ destination, dates, travelers, flights, hotels, costs, description, overview, tips }: TripOverviewProps) {
  const numDays = Math.ceil(
    (new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const tripGist = [
    flights && `Flight to ${destination}${flights.comfort ? ` (${flights.comfort.airline})` : ""}`,
    hotels?.midRange?.[0] && `Stay at ${hotels.midRange[0].name}, ${hotels.midRange[0].location}`,
    `Explore ${destination}'s top attractions, culture, and cuisine`,
    `Perfect ${numDays}-day itinerary tailored to your interests`,
  ].filter(Boolean);

  return (
    <Card className="bg-white shadow-2xl border border-gray-100 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          Trip Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {description && (
          <p className="text-gray-700 mb-6 leading-relaxed text-lg">{description}</p>
        )}
        
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-900 mb-3">Trip Gist</h3>
          <ul className="space-y-2">
            {tripGist.map((item, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="text-purple-600 mt-1">•</span>
                <span className="text-gray-700">{item}</span>
              </motion.li>
            ))}
          </ul>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-semibold text-gray-900">{numDays} days</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Travelers</p>
                <p className="font-semibold text-gray-900">{travelers}</p>
              </div>
            </div>
            {flights?.comfort && (
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Flight</p>
                  <p className="font-semibold text-gray-900">{flights.comfort.priceRange}</p>
                </div>
              </div>
            )}
            {costs?.balanced && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Total Cost</p>
                  <p className="font-semibold text-gray-900">{costs.balanced.total}</p>
                </div>
              </div>
            )}
          </div>

          {/* Overview Section */}
          {overview && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-600" />
                Overview & Budget
              </h3>
              
              {overview.budget && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {overview.budget.accommodation && (
                      <div>
                        <p className="text-gray-600">Accommodation</p>
                        <p className="font-semibold text-gray-900">{overview.budget.accommodation}</p>
                      </div>
                    )}
                    {overview.budget.food && (
                      <div>
                        <p className="text-gray-600">Food</p>
                        <p className="font-semibold text-gray-900">{overview.budget.food}</p>
                      </div>
                    )}
                    {overview.budget.transport && (
                      <div>
                        <p className="text-gray-600">Transport</p>
                        <p className="font-semibold text-gray-900">{overview.budget.transport}</p>
                      </div>
                    )}
                    {overview.budget.activities && (
                      <div>
                        <p className="text-gray-600">Activities</p>
                        <p className="font-semibold text-gray-900">{overview.budget.activities}</p>
                      </div>
                    )}
                    {overview.budget.total && (
                      <div className="col-span-2 md:col-span-3 pt-2 border-t border-purple-200">
                        <p className="text-gray-600">Total Budget</p>
                        <p className="font-bold text-lg text-purple-700">{overview.budget.total}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {overview.transportPass && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Transport Pass Recommendation:</p>
                  <p className="text-sm text-gray-700">{overview.transportPass}</p>
                </div>
              )}

              {overview.practicalInfo && overview.practicalInfo.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">Practical Information:</p>
                  <ul className="space-y-1">
                    {overview.practicalInfo.map((info, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{info}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tips Section */}
          {tips && tips.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Travel Tips
              </h3>
              <ul className="space-y-2">
                {tips.map((tip, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

