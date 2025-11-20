"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Hotel, X, ExternalLink } from "lucide-react";
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
  const [hotelTier, setHotelTier] = useState<"budget" | "luxury" | "mid">("mid");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flightsLoaded, setFlightsLoaded] = useState(false);
  const [hotelsLoaded, setHotelsLoaded] = useState(false);
  const [iframeError, setIframeError] = useState<{flights?: boolean, hotels?: boolean}>({});
  const flightsIframeRef = useRef<HTMLIFrameElement>(null);
  const hotelsIframeRef = useRef<HTMLIFrameElement>(null);

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

  useEffect(() => {
    // Reset loaded state when tab changes
    if (activeTab === "flights") {
      setFlightsLoaded(false);
      setIframeError(prev => ({ ...prev, flights: false }));
    } else {
      setHotelsLoaded(false);
      setIframeError(prev => ({ ...prev, hotels: false }));
    }
  }, [activeTab, hotelTier]);

  // Timeout check for iframes - many sites block iframe embedding
  useEffect(() => {
    const flightsTimer = setTimeout(() => {
      if (!flightsLoaded && !iframeError.flights && activeTab === "flights") {
        try {
          const iframe = flightsIframeRef.current;
          if (iframe) {
            // Try to access iframe - if it throws, it's blocked
            try {
              iframe.contentWindow?.location;
              handleIframeLoad("flights");
            } catch (e) {
              // Cross-origin error - iframe is blocked
              handleIframeError("flights");
            }
          }
        } catch (e) {
          handleIframeError("flights");
        }
      }
    }, 5000);

    const hotelsTimer = setTimeout(() => {
      if (!hotelsLoaded && !iframeError.hotels && activeTab === "hotels") {
        try {
          const iframe = hotelsIframeRef.current;
          if (iframe) {
            try {
              iframe.contentWindow?.location;
              handleIframeLoad("hotels");
            } catch (e) {
              handleIframeError("hotels");
            }
          }
        } catch (e) {
          handleIframeError("hotels");
        }
      }
    }, 5000);

    return () => {
      clearTimeout(flightsTimer);
      clearTimeout(hotelsTimer);
    };
  }, [activeTab, flightsLoaded, hotelsLoaded, iframeError, hotelTier]);

  const handleIframeLoad = (type: "flights" | "hotels") => {
    if (type === "flights") {
      setFlightsLoaded(true);
    } else {
      setHotelsLoaded(true);
    }
  };

  const handleIframeError = (type: "flights" | "hotels") => {
    setIframeError(prev => ({ ...prev, [type]: true }));
    if (type === "flights") {
      setFlightsLoaded(true); // Hide loading even on error
    } else {
      setHotelsLoaded(true);
    }
  };

  return (
    <>
      <Card className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-300/50 hover:border-purple-400 transition-all">
        <CardHeader className="bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100 border-b-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-1">
                {activeTab === "flights" ? (
                  <Plane className="w-6 h-6 text-purple-600" />
                ) : (
                  <Hotel className="w-6 h-6 text-purple-600" />
                )}
                {activeTab === "flights" ? "Book Flights" : "Book Hotels"}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === "flights" 
                  ? `Searching flights to ${destination} from ${startDate} to ${endDate} for ${travelers} ${travelers === 1 ? 'traveler' : 'travelers'}`
                  : `Searching hotels in ${destination} from ${startDate} to ${endDate} for ${travelers} ${travelers === 1 ? 'guest' : 'guests'}`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.open(activeTab === "flights" ? flightsLink : getHotelLink(), '_blank')}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Open
              </Button>
              <Button
                onClick={() => setIsFullscreen(true)}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Fullscreen
              </Button>
            </div>
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
              <div className="h-[700px] w-full relative bg-gradient-to-br from-gray-50 to-white rounded-b-lg overflow-hidden border-t-2 border-purple-100">
                {/* Loading Overlay */}
                {!flightsLoaded && !iframeError.flights && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 z-20">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading Google Flights...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                    </div>
                  </div>
                )}
                
                {/* Fallback Message - Show if iframe is blocked or after timeout */}
                {iframeError.flights && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 z-20 border-2 border-dashed border-purple-300 rounded-lg m-4">
                    <div className="text-center p-8 max-w-md">
                      <Plane className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <p className="text-gray-800 font-semibold mb-2 text-lg">Google Flights Search Ready</p>
                      <p className="text-gray-600 text-sm mb-6">
                        Google Flights blocks iframe embedding for security. Click below to open in a new tab with your search pre-filled.
                      </p>
                      <div className="space-y-3">
                        <Button
                          onClick={() => window.open(flightsLink, '_blank')}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Google Flights in New Tab
                        </Button>
                        <p className="text-xs text-gray-500">
                          Destination: {destination} | Dates: {startDate} to {endDate} | Travelers: {travelers}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Iframe - Try to load, show fallback if blocked */}
                {!iframeError.flights && (
                  <iframe
                    ref={flightsIframeRef}
                    src={flightsLink}
                    className="w-full h-full border-0 rounded-b-lg relative z-10"
                    title="Google Flights"
                    allow="fullscreen"
                    allowFullScreen
                    loading="eager"
                    onLoad={() => {
                      setTimeout(() => handleIframeLoad("flights"), 2000);
                    }}
                    onError={() => handleIframeError("flights")}
                    style={{ minHeight: '700px', display: flightsLoaded ? 'block' : 'none' }}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="hotels" className="m-0 p-0">
              <div className="border-b-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={() => setHotelTier("budget")}
                    variant={hotelTier === "budget" ? "default" : "outline"}
                    size="lg"
                    className={hotelTier === "budget" 
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-lg scale-105" 
                      : "border-green-300 text-green-700 hover:bg-green-50"
                    }
                  >
                    💰 Budget
                    {hotelTier === "budget" && <span className="ml-2 text-xs">($50-120/night)</span>}
                  </Button>
                  <Button
                    onClick={() => setHotelTier("mid")}
                    variant={hotelTier === "mid" ? "default" : "outline"}
                    size="lg"
                    className={hotelTier === "mid" 
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg scale-105" 
                      : "border-purple-300 text-purple-700 hover:bg-purple-50"
                    }
                  >
                    ⭐ Mid-Range
                    {hotelTier === "mid" && <span className="ml-2 text-xs">($120-250/night)</span>}
                  </Button>
                  <Button
                    onClick={() => setHotelTier("luxury")}
                    variant={hotelTier === "luxury" ? "default" : "outline"}
                    size="lg"
                    className={hotelTier === "luxury" 
                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg scale-105" 
                      : "border-amber-300 text-amber-700 hover:bg-amber-50"
                    }
                  >
                    ✨ Luxury
                    {hotelTier === "luxury" && <span className="ml-2 text-xs">($250+/night)</span>}
                  </Button>
                </div>
                <p className="text-center text-sm text-gray-600 mt-3">
                  {hotelTier === "budget" && "💰 Budget-friendly options"}
                  {hotelTier === "mid" && "⭐ Comfortable mid-range hotels"}
                  {hotelTier === "luxury" && "✨ Premium luxury accommodations"}
                </p>
              </div>
              <div className="h-[700px] w-full relative bg-gradient-to-br from-gray-50 to-white rounded-b-lg overflow-hidden border-t-2 border-purple-100">
                {/* Loading Overlay */}
                {!hotelsLoaded && !iframeError.hotels && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 z-20">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading Booking.com...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                    </div>
                  </div>
                )}

                {/* Fallback Message - Show if iframe is blocked */}
                {iframeError.hotels && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 z-20 border-2 border-dashed border-purple-300 rounded-lg m-4">
                    <div className="text-center p-8 max-w-md">
                      <Hotel className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <p className="text-gray-800 font-semibold mb-2 text-lg">Booking.com Search Ready</p>
                      <p className="text-gray-600 text-sm mb-4">
                        {hotelTier === "budget" && "💰 Budget hotels"}
                        {hotelTier === "mid" && "⭐ Mid-range hotels"}
                        {hotelTier === "luxury" && "✨ Luxury hotels"}
                      </p>
                      <p className="text-gray-600 text-sm mb-6">
                        Booking.com blocks iframe embedding for security. Click below to open in a new tab with your search pre-filled.
                      </p>
                      <div className="space-y-3">
                        <Button
                          onClick={() => window.open(getHotelLink(), '_blank')}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Booking.com in New Tab
                        </Button>
                        <p className="text-xs text-gray-500">
                          {destination} | {startDate} to {endDate} | {travelers} {travelers === 1 ? 'guest' : 'guests'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Iframe - Try to load, show fallback if blocked */}
                {!iframeError.hotels && (
                  <iframe
                    ref={hotelsIframeRef}
                    key={hotelTier} // Force reload when tier changes
                    src={getHotelLink()}
                    className="w-full h-full border-0 rounded-b-lg relative z-10"
                    title="Booking.com Hotels"
                    allow="fullscreen"
                    allowFullScreen
                    loading="eager"
                    onLoad={() => {
                      setTimeout(() => handleIframeLoad("hotels"), 2000);
                    }}
                    onError={() => handleIframeError("hotels")}
                    style={{ minHeight: '700px', display: hotelsLoaded ? 'block' : 'none' }}
                  />
                )}
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

