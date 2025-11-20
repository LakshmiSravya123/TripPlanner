"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Users, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import FlightsTable from "./FlightsTable";
import HotelsTable from "./HotelsTable";
import WeatherForecast from "./WeatherForecast";
import ItineraryTabs from "./ItineraryTabs";
import CostSummary from "./CostSummary";
import EnhancedDestinationMap from "./EnhancedDestinationMap";
import InspirationSection from "./InspirationSection";
import PlacesGallery from "./PlacesGallery";
import TripOverview from "./TripOverview";
import CherryBlossomReveal from "./magic/CherryBlossomReveal";
import ButterflyConfetti from "./magic/ButterflyConfetti";
import AIChat from "./magic/AIChat";
import BookingIframes from "./BookingIframes";
import { getDestinationImage } from "@/lib/images";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { buildGoogleFlightsLink, buildBookingLink } from "@/lib/utils";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

interface TripResultsProps {
  data: any;
  onBack: () => void;
}

export default function TripResults({ data, onBack }: TripResultsProps) {
  const [activeTab, setActiveTab] = useState<"economic" | "balanced" | "luxury">("balanced");
  const [showCherryBlossom, setShowCherryBlossom] = useState(true);
  const [showButterflies, setShowButterflies] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const backgroundImage = getDestinationImage(data.destination);

  const handleSaveTrip = () => {
    setShowButterflies(true);
    setShowConfetti(true);
    toast.success("Trip saved! ✨", {
      description: "Your magical journey has been saved to My Trips",
      duration: 3000,
    });
    setTimeout(() => {
      setShowButterflies(false);
      setShowConfetti(false);
    }, 5000);
  };

  return (
    <>
      {/* AI Chat - Always visible */}
      <AIChat tripData={data} />
      
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 0}
          height={typeof window !== "undefined" ? window.innerHeight : 0}
          recycle={false}
          numberOfPieces={300}
          gravity={0.2}
        />
      )}
      <ButterflyConfetti trigger={showButterflies} />
      {showCherryBlossom ? (
        <CherryBlossomReveal onComplete={() => setShowCherryBlossom(false)}>
          <div className="min-h-screen relative">
            {/* Hero Section with Background Image */}
            <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
              </div>
              
              <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-between py-8">
                <div className="flex justify-between items-start">
                  <Button
                    onClick={onBack}
                    variant="ghost"
                    className="text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSaveTrip}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white backdrop-blur-sm shadow-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Trip
                  </Button>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-white mb-8"
                >
                  <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg">
                    {data.destination}
                  </h1>
                  <div className="flex items-center justify-center gap-6 text-white/90 mt-4">
                    <span className="flex items-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
                      <Calendar className="w-5 h-5" />
                      {data.dates.start} - {data.dates.end}
                    </span>
                    <span className="flex items-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
                      <Users className="w-5 h-5" />
                      {data.travelers} {data.travelers === 1 ? "Traveler" : "Travelers"}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Content Section */}
            <div className="relative -mt-20 z-20">
              <div className="container mx-auto px-4 pb-16">
                <div className="max-w-7xl mx-auto space-y-8">
            {/* Trip Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <TripOverview
                destination={data.destination}
                dates={data.dates}
                travelers={data.travelers}
                flights={data.flights}
                hotels={data.hotels}
                costs={data.costs}
                description={data.description}
              />
            </motion.div>

            {/* Inspiration Section */}
            {(data.description || data.inspiration) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <InspirationSection
                  destination={data.destination}
                  description={data.description}
                  inspiration={data.inspiration}
                />
              </motion.div>
            )}

            {/* Enhanced Destination Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <EnhancedDestinationMap
                destination={data.destination}
                places={data.places}
                description={data.description}
              />
            </motion.div>

            {/* Places Gallery */}
            {data.places && data.places.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <PlacesGallery destination={data.destination} places={data.places} />
              </motion.div>
            )}

            {/* Weather Forecast */}
            {data.weather && data.weather.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <WeatherForecast weather={data.weather} />
              </motion.div>
            )}

            {/* Booking Iframes - Flights & Hotels - Always show */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <BookingIframes
                destination={data.destination || "Destination"}
                startDate={data.dates?.start || new Date().toISOString().split('T')[0]}
                endDate={data.dates?.end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                travelers={data.travelers || 2}
                budgetPerNight={200}
                  flightsLink={data.flights?.economy?.link || data.flights?.comfort?.link || data.flights?.premium?.link || buildGoogleFlightsLink(data.destination || "Destination", data.dates?.start || new Date().toISOString().split('T')[0], data.dates?.end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], "NYC", data.travelers || 2)}
                hotelsBudgetLink={data.hotels?.budget?.[0]?.link || buildBookingLink(data.destination || "Destination", data.dates?.start || new Date().toISOString().split('T')[0], data.dates?.end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], data.travelers || 2, 100)}
                hotelsMidLink={data.hotels?.midRange?.[0]?.link || data.hotels?.mid?.[0]?.link || buildBookingLink(data.destination || "Destination", data.dates?.start || new Date().toISOString().split('T')[0], data.dates?.end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], data.travelers || 2, 200)}
                hotelsLuxuryLink={data.hotels?.luxury?.[0]?.link || buildBookingLink(data.destination || "Destination", data.dates?.start || new Date().toISOString().split('T')[0], data.dates?.end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], data.travelers || 2)}
              />
            </motion.div>

            {/* Flights Table (Fallback) */}
            {data.flights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <FlightsTable flights={data.flights} />
              </motion.div>
            )}

            {/* Hotels Table (Fallback) */}
            {data.hotels && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <HotelsTable hotels={data.hotels} />
              </motion.div>
            )}

            {/* Itinerary Tabs */}
            {data.itineraries && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ItineraryTabs
                  itineraries={data.itineraries}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </motion.div>
            )}

            {/* Cost Summary */}
            {data.costs && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <CostSummary costs={data.costs} />
              </motion.div>
                )}
                </div>
              </div>
            </div>
          </div>
        </CherryBlossomReveal>
      ) : (
        <div className="min-h-screen relative">
          {/* Hero Section with Background Image */}
          <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${backgroundImage})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            </div>
            
            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-between py-8">
              <div className="flex justify-between items-start">
                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSaveTrip}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white backdrop-blur-sm shadow-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Trip
                </Button>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-white mb-8"
              >
                <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg">
                  {data.destination}
                </h1>
                <div className="flex items-center justify-center gap-6 text-white/90 mt-4">
                  <span className="flex items-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
                    <Calendar className="w-5 h-5" />
                    {data.dates.start} - {data.dates.end}
                  </span>
                  <span className="flex items-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
                    <Users className="w-5 h-5" />
                    {data.travelers} {data.travelers === 1 ? "Traveler" : "Travelers"}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative -mt-20 z-20">
            <div className="container mx-auto px-4 pb-16">
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Trip Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <TripOverview
                    destination={data.destination}
                    dates={data.dates}
                    travelers={data.travelers}
                    flights={data.flights}
                    hotels={data.hotels}
                    costs={data.costs}
                    description={data.description}
                  />
                </motion.div>

                {/* Inspiration Section */}
                {(data.description || data.inspiration) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <InspirationSection
                      destination={data.destination}
                      description={data.description}
                      inspiration={data.inspiration}
                    />
                  </motion.div>
                )}

                {/* Enhanced Destination Map */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <EnhancedDestinationMap
                    destination={data.destination}
                    places={data.places}
                    description={data.description}
                  />
                </motion.div>

                {/* Places Gallery */}
                {data.places && data.places.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <PlacesGallery destination={data.destination} places={data.places} />
                  </motion.div>
                )}

                {/* Weather Forecast */}
                {data.weather && data.weather.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <WeatherForecast weather={data.weather} />
                  </motion.div>
                )}

                {/* Flights Table */}
                {data.flights && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <FlightsTable flights={data.flights} />
                  </motion.div>
                )}

                {/* Hotels Table */}
                {data.hotels && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <HotelsTable hotels={data.hotels} />
                  </motion.div>
                )}

                {/* Itinerary Tabs */}
                {data.itineraries && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <ItineraryTabs
                      itineraries={data.itineraries}
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                    />
                  </motion.div>
                )}

                {/* Cost Summary */}
                {data.costs && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <CostSummary costs={data.costs} />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
