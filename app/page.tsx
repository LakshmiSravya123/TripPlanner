"use client";

// Import polyfill first to fix react-three-fiber compatibility
import "@/lib/react-polyfill";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import TripResults from "@/components/TripResults";
import MagicalForm from "@/components/magic/MagicalForm";
import InkRevealText from "@/components/magic/InkRevealText";
// Dynamically import Globe3D to avoid SSR issues with Three.js
const Globe3D = dynamic(() => import("@/components/magic/Globe3D"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center"><div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
});
import { Sparkles } from "lucide-react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

// Dynamically import heavy components
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function Home() {
  const [tripData, setTripData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [destination, setDestination] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll setup
  useSmoothScroll();

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setDestination(formData.destination);
    
    try {
      const response = await fetch("/api/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse response:", jsonError);
        const text = await response.text();
        console.error("Response text:", text);
        throw new Error("Invalid response from server. Please check your API key and try again.");
      }
      
      if (response.ok) {
        // Cherry blossom reveal animation
        setTimeout(() => {
          setTripData(result);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }, 2000);
      } else {
        console.error("API Error:", result);
        const errorMessage = result?.error || "Unknown error occurred";
        alert(`Error generating trip plan: ${errorMessage}\n\nPlease check:\n1. Your OpenAI API key is set correctly\n2. You have API credits available\n3. Your internet connection is stable`);
      }
    } catch (error: any) {
      console.error("Error generating trip:", error);
      const errorMessage = error?.message || "Network error or server unavailable";
      alert(`Failed to generate trip plan: ${errorMessage}\n\nPlease check:\n1. Your OpenAI API key is set in .env.local\n2. The dev server is running\n3. Your internet connection is stable`);
    } finally {
      setLoading(false);
    }
  };

  if (tripData) {
    return (
      <>
        {showConfetti && typeof window !== "undefined" && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        )}
        <TripResults data={tripData} onBack={() => setTripData(null)} />
      </>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {typeof window !== "undefined" && [...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            initial={{
              x: Math.random() * (window.innerWidth || 1920),
              y: Math.random() * (window.innerHeight || 1080),
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * (window.innerHeight || 1080)],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
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
              Tell me your destination, style and budget, and I'll design a magical trip for you.
            </p>
          </motion.div>
        </motion.div>

        {/* Loading Phoenix Animation */}
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
                  <Sparkles className="w-24 h-24 text-yellow-400 mx-auto" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-semibold text-white mb-4"
                >
                  Creating your magical trip...
                </motion.p>
                <motion.div
                  className="flex gap-2 justify-center"
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
            <MagicalForm onSubmit={handleSubmit} loading={loading} />
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
