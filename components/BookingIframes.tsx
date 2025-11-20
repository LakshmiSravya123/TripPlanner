"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Hotel, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface BookingIframesProps {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budgetPerNight: number;
  flightsLink: string;
  hotelsBudgetLink: string;
  hotelsMidLink: string;
  hotelsLuxuryLink: string;
}

export default function BookingIframes({
  destination,
  startDate,
  endDate,
  travelers,
  budgetPerNight,
  flightsLink,
  hotelsBudgetLink,
  hotelsMidLink,
  hotelsLuxuryLink,
}: BookingIframesProps) {
  const [activeTab, setActiveTab] = useState<"flights" | "hotels">("flights");
  const [hotelTier, setHotelTier] = useState<"budget" | "mid" | "luxury">("mid");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getHotelLink = () => {
    switch (hotelTier) {
      case "budget":
        return hotelsBudgetLink;
      case "mid":
        return hotelsMidLink;
      case "luxury":
        return hotelsLuxuryLink;
      default:
        return hotelsMidLink;
    }
  };

  return (
    <>
      <Card className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              {activeTab === "flights" ? (
                <Plane className="w-6 h-6 text-purple-600" />
              ) : (
                <Hotel className="w-6 h-6 text-purple-600" />
              )}
              {activeTab === "flights" ? "Book Flights" : "Book Hotels"}
            </CardTitle>
            <Button
              onClick={() => setIsFullscreen(true)}
              variant="outline"
              size="sm"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Fullscreen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "flights" | "hotels")}>
            <TabsList className="w-full rounded-none border-b border-gray-200 bg-gray-50">
              <TabsTrigger value="flights" className="flex-1">
                <Plane className="w-4 h-4 mr-2" />
                Flights
              </TabsTrigger>
              <TabsTrigger value="hotels" className="flex-1">
                <Hotel className="w-4 h-4 mr-2" />
                Hotels
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flights" className="m-0 p-0">
              <div className="h-[600px] w-full relative">
                <iframe
                  src={flightsLink}
                  className="w-full h-full border-0"
                  title="Google Flights"
                  allow="fullscreen"
                  loading="lazy"
                />
              </div>
            </TabsContent>

            <TabsContent value="hotels" className="m-0 p-0">
              <div className="border-b border-gray-200 bg-gray-50 p-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setHotelTier("budget")}
                    variant={hotelTier === "budget" ? "default" : "outline"}
                    size="sm"
                    className={hotelTier === "budget" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    Budget
                  </Button>
                  <Button
                    onClick={() => setHotelTier("mid")}
                    variant={hotelTier === "mid" ? "default" : "outline"}
                    size="sm"
                    className={hotelTier === "mid" ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    Mid-Range
                  </Button>
                  <Button
                    onClick={() => setHotelTier("luxury")}
                    variant={hotelTier === "luxury" ? "default" : "outline"}
                    size="sm"
                    className={hotelTier === "luxury" ? "bg-amber-600 hover:bg-amber-700" : ""}
                  >
                    Luxury
                  </Button>
                </div>
              </div>
              <div className="h-[600px] w-full relative">
                <iframe
                  src={getHotelLink()}
                  className="w-full h-full border-0"
                  title="Booking.com Hotels"
                  allow="fullscreen"
                  loading="lazy"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-4 md:inset-8 bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <h3 className="text-xl font-bold text-gray-900">
                    {activeTab === "flights" ? "Google Flights" : "Booking.com"}
                  </h3>
                  <Button
                    onClick={() => setIsFullscreen(false)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex-1 relative">
                  {activeTab === "flights" ? (
                    <iframe
                      src={flightsLink}
                      className="w-full h-full border-0"
                      title="Google Flights"
                      allow="fullscreen"
                    />
                  ) : (
                    <>
                      <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <Button
                          onClick={() => setHotelTier("budget")}
                          variant={hotelTier === "budget" ? "default" : "outline"}
                          size="sm"
                          className={hotelTier === "budget" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          Budget
                        </Button>
                        <Button
                          onClick={() => setHotelTier("mid")}
                          variant={hotelTier === "mid" ? "default" : "outline"}
                          size="sm"
                          className={hotelTier === "mid" ? "bg-purple-600 hover:bg-purple-700" : ""}
                        >
                          Mid-Range
                        </Button>
                        <Button
                          onClick={() => setHotelTier("luxury")}
                          variant={hotelTier === "luxury" ? "default" : "outline"}
                          size="sm"
                          className={hotelTier === "luxury" ? "bg-amber-600 hover:bg-amber-700" : ""}
                        >
                          Luxury
                        </Button>
                      </div>
                      <iframe
                        src={getHotelLink()}
                        className="w-full h-full border-0"
                        title="Booking.com Hotels"
                        allow="fullscreen"
                      />
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

