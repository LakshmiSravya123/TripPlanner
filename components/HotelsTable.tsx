"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HotelsTableProps {
  hotels: {
    budget: Array<{ name: string; location: string; priceRange: string; rating: number; link: string }>;
    midRange: Array<{ name: string; location: string; priceRange: string; rating: number; link: string }>;
    luxury: Array<{ name: string; location: string; priceRange: string; rating: number; link: string }>;
  };
}

export default function HotelsTable({ hotels }: HotelsTableProps) {
  // Add safety checks for hotels data
  if (!hotels) {
    return (
      <Card className="bg-white shadow-2xl border border-gray-100 rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            Hotel Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 py-4">No hotel data available</p>
        </CardContent>
      </Card>
    );
  }

  // Create safe hotel data with fallbacks
  const defaultHotel = { name: "Recommended Hotels", location: "City Center", priceRange: "$100-200", rating: 4.0, link: "#" };
  
  const tiers = [
    { name: "Budget", data: hotels.budget || [defaultHotel], color: "border-l-green-500" },
    { name: "Mid-Range", data: hotels.midRange || [defaultHotel], color: "border-l-blue-500" },
    { name: "Luxury", data: hotels.luxury || [defaultHotel], color: "border-l-amber-500" },
  ];

  return (
    <Card className="bg-white shadow-2xl border border-gray-100 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Hotel className="w-6 h-6 text-white" />
          </div>
          Hotel Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tiers.map((tier) => (
          <div key={tier.name} className="mb-8 last:mb-0">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{tier.name}</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Hotel Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Price/Night</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Rating</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Book</th>
                  </tr>
                </thead>
                <tbody>
                  {(tier.data || []).map((hotel, idx) => {
                    // Additional safety check for each hotel
                    const safeHotel = hotel || { name: "Hotel", location: "Location", priceRange: "$100", rating: 4.0, link: "#" };
                    
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${tier.color} border-l-4`}
                      >
                        <td className="py-3 px-4 font-semibold text-gray-900">{safeHotel.name || "Hotel"}</td>
                        <td className="py-3 px-4 text-gray-600">{safeHotel.location || "Location"}</td>
                        <td className="py-3 px-4 font-semibold text-purple-600">
                          {safeHotel.priceRange || "$100"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-gray-700">{safeHotel.rating || 4.0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <a
                            href={safeHotel.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium border border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-colors"
                          >
                            Booking.com
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
