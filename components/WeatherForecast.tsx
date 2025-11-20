"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, CloudSnow, CloudSun } from "lucide-react";

interface WeatherForecastProps {
  weather: Array<{ date: string; min: number; max: number; condition?: string; code?: number }>;
}

const getWeatherIcon = (condition: string | undefined) => {
  if (!condition) return <Cloud className="w-6 h-6 text-gray-400" />;
  const lower = condition.toLowerCase();
  if (lower.includes("sunny") || lower.includes("clear")) return <Sun className="w-6 h-6 text-yellow-500" />;
  if (lower.includes("rain") || lower.includes("drizzle") || lower.includes("shower")) return <CloudRain className="w-6 h-6 text-blue-500" />;
  if (lower.includes("snow")) return <CloudSnow className="w-6 h-6 text-gray-400" />;
  return <Cloud className="w-6 h-6 text-gray-400" />;
};

export default function WeatherForecast({ weather }: WeatherForecastProps) {
  return (
    <Card className="bg-white shadow-2xl border border-gray-100 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          Weather During Your Trip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {weather.map((day, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 min-w-[140px] text-center"
            >
              <div className="flex justify-center mb-2">
                {getWeatherIcon(day.condition)}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">
                Day {idx + 1}
              </div>
              <div className="text-xs text-gray-500 mb-2">{day.date}</div>
              <div className="text-lg font-bold text-gray-800">
                {day.min}°-{day.max}°C
              </div>
              <div className="text-xs text-gray-600 mt-1">{day.condition || "Unknown"}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

