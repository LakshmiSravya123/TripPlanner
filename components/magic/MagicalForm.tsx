"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plane, Calendar, Users, DollarSign, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MagicalFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

const interests = [
  { id: "beaches", label: "Beaches", icon: "🏖️", color: "from-blue-400 to-cyan-400" },
  { id: "history", label: "History", icon: "🏛️", color: "from-amber-400 to-orange-400" },
  { id: "nature", label: "Nature", icon: "⛰️", color: "from-green-400 to-emerald-400" },
  { id: "food", label: "Food", icon: "🍷", color: "from-purple-400 to-pink-400" },
  { id: "adventure", label: "Adventure", icon: "🎢", color: "from-red-400 to-rose-400" },
  { id: "relax", label: "Relax", icon: "🧘", color: "from-indigo-400 to-blue-400" },
  { id: "nightlife", label: "Nightlife", icon: "🌃", color: "from-violet-400 to-purple-400" },
];

export default function MagicalForm({ onSubmit, loading }: MagicalFormProps) {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(200);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [hoveredInterest, setHoveredInterest] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !destination) {
      return;
    }
    onSubmit({
      destination,
      startDate,
      endDate,
      travelers,
      budgetPerNight: budget,
      interests: selectedInterests,
    });
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Destination - Glowing Glass Orb */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <Plane className="w-5 h-5 text-purple-600" />
          Destination
        </label>
        <motion.div
          className="relative"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="relative w-full px-6 py-4 rounded-2xl border-2 border-purple-200/50 bg-white/80 backdrop-blur-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200/50 transition-all text-lg"
            placeholder="Where do you want to go?"
            required
          />
        </motion.div>
      </motion.div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            Start Date
          </label>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
            <input
              type="date"
              value={startDate}
              min={minDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="relative w-full px-6 py-4 rounded-2xl border-2 border-blue-200/50 bg-white/80 backdrop-blur-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all"
              required
            />
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            End Date
          </label>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-2xl blur-xl" />
            <input
              type="date"
              value={endDate}
              min={startDate || minDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="relative w-full px-6 py-4 rounded-2xl border-2 border-pink-200/50 bg-white/80 backdrop-blur-xl focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-200/50 transition-all"
              required
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Travelers & Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Users className="w-5 h-5 text-purple-600" />
            Travelers
          </label>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl" />
            <select
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="relative w-full px-6 py-4 rounded-2xl border-2 border-green-200/50 bg-white/80 backdrop-blur-xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-200/50 transition-all"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Traveler" : "Travelers"}
                </option>
              ))}
            </select>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <DollarSign className="w-5 h-5 text-purple-600" />
            Budget per Night: <span className="text-purple-600 text-lg">${budget}</span>
          </label>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-xl" />
            <div className="relative px-6 py-4">
              <input
                type="range"
                min="50"
                max="600"
                step="10"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer accent-purple-600 slider-magic"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>$50</span>
                <span>$600</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Interests - Blooming Chips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
          <Heart className="w-5 h-5 text-purple-600" />
          Interests
        </label>
        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {interests.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              const isHovered = hoveredInterest === interest.id;
              
              return (
                <motion.button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  onHoverStart={() => setHoveredInterest(interest.id)}
                  onHoverEnd={() => setHoveredInterest(null)}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: isSelected ? 1.1 : 1,
                    rotate: isSelected ? 0 : 0,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  className={`relative px-5 py-3 rounded-full text-sm font-medium transition-all overflow-hidden ${
                    isSelected
                      ? `bg-gradient-to-r ${interest.color} text-white shadow-2xl`
                      : "bg-white/80 backdrop-blur-xl border-2 border-gray-200 text-gray-700 hover:border-purple-300"
                  }`}
                >
                  {/* Blooming light rays */}
                  {isHovered && (
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${interest.color} opacity-30`}
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 2, rotate: 45 }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                    />
                  )}
                  
                  {/* Floating petals effect */}
                  {isSelected && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-white rounded-full"
                          initial={{
                            x: "50%",
                            y: "50%",
                            opacity: 1,
                            scale: 0,
                          }}
                          animate={{
                            x: Math.random() * 100 - 50 + "%",
                            y: Math.random() * 100 - 50 + "%",
                            opacity: [1, 0],
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.2,
                            repeat: Infinity,
                            repeatDelay: 1,
                          }}
                        />
                      ))}
                    </>
                  )}
                  
                  <span className="relative z-10">
                    {interest.icon} {interest.label}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Submit Button - Liquid Metal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          type="submit"
          disabled={loading}
          className="relative w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white shadow-2xl rounded-2xl overflow-hidden group"
        >
          {/* Liquid metal effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Ripple effect on hover */}
          <motion.div
            className="absolute inset-0 bg-white/30 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 2, opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.6 }}
          />
          
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Creating your magical trip...
              </>
            ) : (
              "Create My Trip ✨"
            )}
          </span>
        </Button>
      </motion.div>
    </form>
  );
}

