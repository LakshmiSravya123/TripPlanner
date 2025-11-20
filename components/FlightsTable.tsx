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
  const flightClasses = [
    { name: "Economy", data: flights.economy, color: "border-l-blue-500" },
    { name: "Comfort", data: flights.comfort, color: "border-l-purple-500" },
    { name: "Premium", data: flights.premium, color: "border-l-amber-500" },
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
              {flightClasses.map((flightClass, idx) => (
                <tr
                  key={flightClass.name}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${flightClass.color} border-l-4`}
                >
                  <td className="py-4 px-4 font-semibold text-gray-900">{flightClass.name}</td>
                  <td className="py-4 px-4 text-gray-700">{flightClass.data.airline}</td>
                  <td className="py-4 px-4 font-semibold text-purple-600">
                    {flightClass.data.priceRange}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{flightClass.data.duration}</td>
                  <td className="py-4 px-4">
                    <a
                      href={flightClass.data.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium border border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    >
                      Google Flights
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
