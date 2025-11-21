"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Plane, Hotel, MapPin, Download, Calendar, Users, DollarSign, Cloud, Sun, Wind, Loader2, Train } from "lucide-react";
import { motion } from "framer-motion";

interface Day {
  day: number;
  date: string;
  title?: string;
  activities: Array<{
    time: string;
    title: string;
    location?: string;
    description?: string;
    transportation?: string;
    cost?: string;
    tips?: string;
  }>;
  dailyTotal?: string;
}

interface TimelineItineraryProps {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  group?: string;
  days: Day[];
  weather?: Array<{ date: string; condition: string; min: number; max: number }>;
}

export default function TimelineItinerary({
  destination,
  startDate,
  endDate,
  travelers,
  group,
  days,
  weather = [],
}: TimelineItineraryProps) {
  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const element = document.getElementById("trip-itinerary-timeline");
      if (!element) {
        alert("Itinerary content not found");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      // Split into multiple pages if needed
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = height;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, width, height);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - height;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, width, height);
        heightLeft -= pageHeight;
      }

      pdf.save(`${destination}-Trip-${startDate}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const getWeatherForDate = (date: string) => {
    const weatherDay = weather.find((w) => w.date === date);
    if (weatherDay) {
      const isSunny = weatherDay.condition.toLowerCase().includes("sun") || 
                     weatherDay.condition.toLowerCase().includes("clear");
      return {
        temp: `${weatherDay.min}°C–${weatherDay.max}°C`,
        icon: isSunny ? "☀" : "☁",
        condition: weatherDay.condition,
      };
    }
    return { temp: "N/A", icon: "☁", condition: "Unknown" };
  };

  const getWeekday = (date: string) => {
    try {
      return format(new Date(date), "EEE");
    } catch {
      return "";
    }
  };

  const getDayNumber = (date: string) => {
    try {
      return format(new Date(date), "d");
    } catch {
      return "";
    }
  };

  const getMonth = (date: string) => {
    try {
      return format(new Date(date), "MMM");
    } catch {
      return "";
    }
  };

  // Build booking links
  const googleFlightsLink = `https://www.google.com/travel/flights?q=Flights+to+${encodeURIComponent(destination)}+on+${startDate}`;
  const bookingLink = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&checkin=${startDate}&checkout=${endDate}&group_adults=${travelers}`;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12" id="trip-itinerary-timeline">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-5xl font-bold text-gray-800 mb-2">
          {destination} • {format(new Date(startDate), "MMMM yyyy")}
        </h2>
        <p className="text-xl text-gray-600">
          {group || `${travelers} ${travelers === 1 ? "traveler" : "travelers"}`} • {days.length} Perfect Days
        </p>
      </motion.div>

      {/* Booking Iframes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-8 mb-12"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <Plane className="w-8 h-8 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">Flights</h3>
          </div>
          <iframe
            src={googleFlightsLink}
            className="w-full h-64 rounded-lg border border-gray-200"
            loading="lazy"
            title="Google Flights"
          />
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <Hotel className="w-8 h-8 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">Hotels</h3>
          </div>
          <iframe
            src={bookingLink}
            className="w-full h-64 rounded-lg border border-gray-200"
            loading="lazy"
            title="Booking.com"
          />
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {days.map((day, index) => {
          const weatherInfo = getWeatherForDate(day.date);
          const isLast = index === days.length - 1;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex gap-8 mb-16 relative"
            >
              {/* Timeline line */}
              {!isLast && (
                <div
                  className="absolute left-16 top-24 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-300"
                  style={{ height: "calc(100% - 6rem)" }}
                />
              )}

              {/* Date Circle */}
              <div className="flex flex-col items-center z-10">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-2xl">
                  <span className="text-3xl font-bold">{getDayNumber(day.date)}</span>
                  <span className="text-sm uppercase">{getMonth(day.date)}</span>
                </div>
                <p className="mt-3 font-bold text-gray-700">{getWeekday(day.date)}</p>
              </div>

              {/* Day Card */}
              <div className="flex-1 bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-1">
                      Day {day.day || index + 1}
                      {day.title && ` • ${day.title}`}
                    </h3>
                    {day.date && (
                      <p className="text-gray-600">{format(new Date(day.date), "EEEE, MMMM d, yyyy")}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-gray-600 text-lg mb-2">
                      {weatherInfo.icon === "☀" ? (
                        <Sun className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <Cloud className="w-6 h-6 text-gray-400" />
                      )}
                      <span>{weatherInfo.temp} {weatherInfo.icon}</span>
                    </div>
                    {day.dailyTotal && (
                      <p className="text-2xl font-bold text-green-600">{day.dailyTotal}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {day.activities && day.activities.length > 0 ? (
                    day.activities.map((act, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 + i * 0.05 }}
                        className="flex gap-5 items-start"
                      >
                        <div className="bg-purple-100 rounded-full p-3 mt-1 flex-shrink-0">
                          <MapPin className="w-6 h-6 text-purple-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-gray-800 mb-1">
                            {act.time || "All Day"} — {act.title || "Activity"}
                          </p>
                          {act.location && (
                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {act.location}
                            </p>
                          )}
                          {act.transportation && (
                            <p className="text-sm text-purple-600 mb-1 flex items-center gap-1">
                              <Train className="w-4 h-4" />
                              {act.transportation}
                            </p>
                          )}
                          {act.description && (
                            <p className="text-gray-600 text-sm mb-1">{act.description}</p>
                          )}
                          {act.cost && (
                            <p className="text-gray-500 text-sm">Cost: {act.cost}</p>
                          )}
                          {act.tips && (
                            <p className="text-amber-600 text-sm mt-2 flex items-start gap-1">
                              <span className="mt-0.5">✦</span>
                              <span>{act.tips}</span>
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No activities scheduled for this day</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Export Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-20"
      >
        <button
          onClick={exportPDF}
          disabled={exporting}
          className="inline-flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:scale-105 transition shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin" /> Exporting...
            </>
          ) : (
            <>
              <Download className="w-7 h-7" /> Download Trip as PDF
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}

