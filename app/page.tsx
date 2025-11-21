"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import InkRevealText from "@/components/magic/InkRevealText";
import TimelineItinerary from "@/components/itinerary/TimelineItinerary";
import Flowchart from "@/components/Flowchart";
import AIChatSidebar from "@/components/AIChatSidebar";
import { Sparkles, Loader2, Calendar as CalendarIcon, MapPin, Users, DollarSign, Gauge } from "lucide-react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { toast } from "sonner";
import type { ItineraryData } from "@/lib/prompt";

// Dynamically import Globe3D to avoid SSR issues with Three.js
const Globe3D = dynamic(() => import("@/components/magic/Globe3D"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center"><div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
});

// Dynamically import heavy components
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function Home() {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [meta, setMeta] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [destination, setDestination] = useState("Japan");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState<number>(7);
  const [travelersDescription, setTravelersDescription] = useState("2 adults");
  const [budgetLevel, setBudgetLevel] = useState("Mid");
  const [pace, setPace] = useState("Balanced");
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll setup
  useSmoothScroll();

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    if (!startDate) {
      setStartDate(tomorrow.toISOString().split("T")[0]);
    }
  }, [startDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !duration) return;

    setLoading(true);

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout (more reasonable)

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          destination,
          startDate,
          duration,
          travelersDescription,
          budgetLevel,
          pace,
        }),
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorText = "";
        try {
          const errorData = await response.json();
          // Ensure error is a string, never [object Object]
          errorText = typeof errorData.error === "string" 
            ? errorData.error 
            : `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorText = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorText);
      }
      
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse response:", jsonError);
        const text = await response.text();
        console.error("Response text:", text);
        throw new Error("Invalid response from server. Please check your API key and try again.");
      }
      
      const dataItinerary: ItineraryData | null = result?.itinerary || null;
      const dataMeta = result?.meta || null;

      if (!dataItinerary || !dataMeta) {
        throw new Error("Server returned an incomplete itinerary. Please try again.");
      }

      // Cherry blossom reveal animation - use requestAnimationFrame to avoid React 423 error
      requestAnimationFrame(() => {
        setTimeout(() => {
          setItinerary(dataItinerary);
          setMeta(dataMeta);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }, 2000);
      });
    } catch (error: any) {
      console.error("Error generating trip:", error);
      
      // Extract error message from response or error object
      let errorMessage = "Unknown error—check console for details.";
      
      try {
        // Try to get error from response JSON
        if (error.message && typeof error.message === "string") {
          errorMessage = error.message;
        } else if (error.error && typeof error.error === "string") {
          errorMessage = error.error;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
      } catch (e) {
        // Fallback if parsing fails
        errorMessage = "Failed to generate trip plan. Please try again.";
      }
      
      // Ensure we never show [object Object] or undefined
      if (typeof errorMessage !== "string" || errorMessage.includes("[object") || !errorMessage.trim()) {
        errorMessage = "Failed to generate trip plan. Please check your API key and try again.";
      }
      
      // Handle specific error types
      if (error.name === "AbortError" || errorMessage.includes("aborted") || errorMessage.includes("timeout")) {
        errorMessage = "Request timed out. The trip generation is taking longer than expected. Please try again with a simpler request.";
      } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError") || errorMessage.includes("Internet issue")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      
      toast.error("Failed to generate trip plan", {
        description: errorMessage,
        duration: 10000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (itinerary && meta) {
    const travelersMatch = typeof meta.travelersDescription === "string" ? meta.travelersDescription.match(/(\d+)/) : null;
    const travelersCount = travelersMatch ? parseInt(travelersMatch[1], 10) || 2 : 2;

    const daysForTimeline = Array.isArray(itinerary.days)
      ? itinerary.days.map((day: any, index: number) => ({
          day: day.day ?? index + 1,
          date: day.date,
          title: day.city,
          dailyTotal: day.dailyTotal,
          activities: Array.isArray(day.activities)
            ? day.activities.map((act: any) => ({
                time: act.time,
                title: act.activity,
                description: act.note,
                transportation: act.transport,
                cost: act.cost,
                tips: act.veggieTip,
              }))
            : [],
        }))
      : [];

    const handleReorderDays = (order: number[]) => {
      if (!itinerary || !Array.isArray(itinerary.days) || order.length === 0) return;

      const originalDays = itinerary.days;
      const numbered = originalDays.map((day: any, index: number) => ({
        value: day,
        num: typeof day.day === "number" ? day.day : index + 1,
      }));

      const byNum = new Map<number, any>();
      numbered.forEach((d) => {
        if (!byNum.has(d.num)) {
          byNum.set(d.num, d.value);
        }
      });

      const reordered: any[] = [];
      order.forEach((num) => {
        const d = byNum.get(num);
        if (d) {
          reordered.push(d);
          byNum.delete(num);
        }
      });

      byNum.forEach((d) => reordered.push(d));

      const updatedItinerary: ItineraryData = {
        ...itinerary,
        days: reordered,
      };

      setItinerary(updatedItinerary);
    };

    return (
      <>
        {showConfetti && (
          <div suppressHydrationWarning>
            {typeof window !== "undefined" && (
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={500}
                gravity={0.3}
              />
            )}
          </div>
        )}
        <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => {
                  try {
                    setItinerary(null);
                    setMeta(null);
                  } catch (error) {
                    console.error("Error clearing itinerary:", error);
                    if (typeof window !== "undefined") {
                      window.location.reload();
                    }
                  }
                }}
                className="text-sm md:text-base px-4 py-2 rounded-full border border-white/30 text-white/90 hover:bg-white/10 transition-all"
              >
                Back to planner
              </button>
              <div className="text-right text-purple-100 text-xs md:text-sm">
                <div className="font-semibold">{meta.destination}</div>
                <div>
                  {meta.startDate} • {meta.duration} days • {meta.travelersDescription}
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[2fr,1.1fr] items-start">
              <div className="order-2 lg:order-1 space-y-8">
                <TimelineItinerary
                  destination={meta.destination}
                  startDate={meta.startDate}
                  endDate={meta.endDate}
                  travelers={travelersCount}
                  group={meta.travelersDescription}
                  days={daysForTimeline}
                />

                <Flowchart days={daysForTimeline} onReorderDays={handleReorderDays} />
              </div>

              <div className="order-1 lg:order-2">
                <AIChatSidebar
                  itinerary={itinerary}
                  meta={{
                    destination: meta.destination,
                    startDate: meta.startDate,
                    duration: meta.duration,
                    travelersDescription: meta.travelersDescription,
                    budgetLevel: meta.budgetLevel,
                    pace: meta.pace,
                  }}
                  onUpdate={setItinerary}
                />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background particles - Client only to avoid hydration mismatch */}
      <div suppressHydrationWarning>
        {typeof window !== "undefined" && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => {
              // Use deterministic seed for each particle to avoid hydration mismatch
              const seed = i * 12345;
              const seededRandom = (multiplier: number) => {
                const x = Math.sin(seed + multiplier) * 10000;
                return x - Math.floor(x);
              };
            const width = window.innerWidth || 1920;
            const height = window.innerHeight || 1080;
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-purple-400 rounded-full"
                initial={{
                  x: seededRandom(1) * width,
                  y: seededRandom(2) * height,
                  opacity: 0,
                }}
                animate={{
                  y: [null, seededRandom(3) * height],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: seededRandom(4) * 10 + 10,
                  repeat: Infinity,
                  delay: seededRandom(5) * 5,
                }}
              />
            );
          })}
          </div>
        )}
      </div>

      <div ref={containerRef} className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section with 3D Globe */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-8"
          >
            <div className="w-full h-[400px] md:h-[500px] relative">
              <Globe3D destination={destination} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <InkRevealText
                text="Hey, I'm your AI Trip Planner"
                className="gradient-text"
                delay={1000}
              />
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
              Tell me your destination, style and budget, and I&apos;ll design a magical trip for you.
            </p>
          </motion.div>
        </motion.div>

        {/* Loading Animation */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mb-8"
                >
                  <Loader2 className="w-24 h-24 text-purple-400 mx-auto animate-spin" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-semibold text-white mb-4"
                >
                  Creating your magical trip...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-purple-200 text-sm"
                >
                  This may take a moment while the AI generates your detailed itinerary
                </motion.p>
                <motion.div
                  className="flex gap-2 justify-center mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-purple-400 rounded-full"
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-100 mb-3">
                  <MapPin className="w-5 h-5 text-purple-300" />
                  Destination
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="relative w-full px-6 py-4 rounded-2xl border-2 border-purple-200/50 bg-white/80 backdrop-blur-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200/50 transition-all text-lg text-gray-900"
                  placeholder="Where do you want to go?"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-100 mb-3">
                    <CalendarIcon className="w-5 h-5 text-blue-300" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="relative w-full px-6 py-4 rounded-2xl border-2 border-blue-200/50 bg-white/80 backdrop-blur-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-100 mb-3">
                    <Gauge className="w-5 h-5 text-emerald-300" />
                    Trip Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value) || 7)}
                    className="relative w-full px-6 py-4 rounded-2xl border-2 border-emerald-200/50 bg-white/80 backdrop-blur-xl focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition-all text-gray-900"
                  >
                    {[3, 5, 7, 10, 14].map((d) => (
                      <option key={d} value={d}>
                        {d} days
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-100 mb-3">
                    <Users className="w-5 h-5 text-green-300" />
                    Travelers
                  </label>
                  <input
                    type="text"
                    value={travelersDescription}
                    onChange={(e) => setTravelersDescription(e.target.value)}
                    placeholder="e.g., 2 adults vegetarian"
                    className="relative w-full px-6 py-4 rounded-2xl border-2 border-green-200/50 bg-white/80 backdrop-blur-xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-200/50 transition-all text-lg text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-100 mb-3">
                    <DollarSign className="w-5 h-5 text-amber-300" />
                    Budget Level
                  </label>
                  <select
                    value={budgetLevel}
                    onChange={(e) => setBudgetLevel(e.target.value)}
                    className="relative w-full px-6 py-4 rounded-2xl border-2 border-amber-200/50 bg-white/80 backdrop-blur-xl focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-200/50 transition-all text-gray-900"
                  >
                    <option value="Low">Low</option>
                    <option value="Mid">Mid</option>
                    <option value="High">High</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-100 mb-3">
                    <Gauge className="w-5 h-5 text-pink-300" />
                    Travel Pace
                  </label>
                  <select
                    value={pace}
                    onChange={(e) => setPace(e.target.value)}
                    className="relative w-full px-6 py-4 rounded-2xl border-2 border-pink-200/50 bg-white/80 backdrop-blur-xl focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-200/50 transition-all text-gray-900"
                  >
                    <option value="Relaxed">Relaxed</option>
                    <option value="Balanced">Balanced</option>
                    <option value="Packed">Packed</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-5 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white shadow-2xl rounded-2xl overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating your magical trip...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Generate My Trip
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Example Prompts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <p className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-4 text-center">
            Try these examples
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Create a 7-day Paris itinerary for a birthday getaway",
              "Plan a budget-friendly vacation to Barcelona",
              "Design a romantic 5-day trip to Rome",
              "Best way to explore London in 4 days",
            ].map((example, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 transition-all text-purple-100 hover:text-white"
              >
                {example}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
