"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlightsTableProps {
  flights: {
    economy: { airline: string; priceRange: string; duration: string; link: string };
    comfort: { airline: string; priceRange: string; duration: string; link: string };
    premium: { airline: string; priceRange: string; duration: string; link: string };
  };
}

export default function FlightsTable({ flights }: FlightsTableProps) {
  // Add safety checks for flights data
  if (!flights) {
    return (
      <Card className="bg-white shadow-2xl border border-gray-100 rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            Flight Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 py-4">No flight data available</p>
        </CardContent>
      </Card>
    );
  }

  // Create safe flight data with fallbacks
  const safeFlights = {
    economy: flights.economy || { airline: "Major Airlines", priceRange: "$600-900", duration: "8h 30m", link: "#" },
    comfort: flights.comfort || { airline: "Major Airlines", priceRange: "$900-1200", duration: "8h 30m", link: "#" },
    premium: flights.premium || { airline: "Major Airlines", priceRange: "$1200-1800", duration: "8h 30m", link: "#" },
  };

  const flightClasses = [
    { name: "Economy", data: safeFlights.economy, color: "border-l-blue-500" },
    { name: "Comfort", data: safeFlights.comfort, color: "border-l-purple-500" },
    { name: "Premium", data: safeFlights.premium, color: "border-l-amber-500" },
  ];

  return (
    <Card className="bg-white shadow-2xl border border-gray-100 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          Best Flight Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Class</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Airline</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Price Range</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Duration</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Book</th>
              </tr>
            </thead>
            <tbody>
              {flightClasses.map((flightClass, idx) => {
                // Additional safety check for each flight class data
                const data = flightClass.data || { airline: "Airlines", priceRange: "Price TBD", duration: "Duration TBD", link: "#" };
                
                return (
                  <tr
                    key={flightClass.name}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${flightClass.color} border-l-4`}
                  >
                    <td className="py-4 px-4 font-semibold text-gray-900">{flightClass.name}</td>
                    <td className="py-4 px-4 text-gray-700">{data.airline || "Airlines"}</td>
                    <td className="py-4 px-4 font-semibold text-purple-600">
                      {data.priceRange || "Price TBD"}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{data.duration || "Duration TBD"}</td>
                    <td className="py-4 px-4">
                      <a
                        href={data.link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium border border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-colors"
                      >
                        Google Flights
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
