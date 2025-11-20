"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, Users, DollarSign, Heart, Sparkles } from "lucide-react";

interface TripFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

export interface TripFormRef {
  loadExample: (data: {
    destination?: string;
    days?: number;
    interests?: string[];
    budget?: number;
    travelers?: number;
  }) => void;
}

const interests = [
  { id: "beaches", label: "Beaches", icon: "🏖️" },
  { id: "history", label: "History/Culture", icon: "🏛️" },
  { id: "nature", label: "Nature/Hiking", icon: "⛰️" },
  { id: "food", label: "Food/Wine", icon: "🍷" },
  { id: "adventure", label: "Adventure", icon: "🎢" },
  { id: "relax", label: "Relax", icon: "🧘" },
  { id: "nightlife", label: "Nightlife", icon: "🌃" },
];

const TripForm = forwardRef<TripFormRef, TripFormProps>(
  ({ onSubmit, loading }, ref) => {
    const [destination, setDestination] = useState("Croatia");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [travelers, setTravelers] = useState(2);
    const [budget, setBudget] = useState(200);
    const [selectedInterests, setSelectedInterests] = useState<string[]>(["beaches", "history"]);

    useImperativeHandle(ref, () => ({
      loadExample: (data) => {
        if (data.destination) setDestination(data.destination);
        if (data.days) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const start = tomorrow.toISOString().split("T")[0];
          const endDate = new Date(tomorrow);
          endDate.setDate(endDate.getDate() + (data.days - 1));
          setStartDate(start);
          setEndDate(endDate.toISOString().split("T")[0]);
        }
        if (data.interests) setSelectedInterests(data.interests);
        if (data.budget) setBudget(data.budget);
        if (data.travelers) setTravelers(data.travelers);
      },
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
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

    // Get tomorrow's date as default min
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card rounded-2xl p-8 md:p-10 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Plane className="w-4 h-4 text-purple-600" />
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all bg-white"
              placeholder="Where do you want to go?"
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                min={minDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all bg-white"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || minDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all bg-white"
                required
              />
            </div>
          </div>

          {/* Travelers & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Users className="w-4 h-4 text-purple-600" />
                Travelers
              </label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Traveler" : "Travelers"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                Budget per Night: <span className="text-purple-600">${budget}</span>
              </label>
              <input
                type="range"
                min="50"
                max="600"
                step="10"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$50</span>
                <span>$600</span>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Heart className="w-4 h-4 text-purple-600" />
              Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <motion.button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedInterests.includes(interest.id)
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  {interest.icon} {interest.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-purple-200 hover:shadow-purple-300 transition-all rounded-xl mt-8"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                Creating your trip...
              </span>
            ) : (
              "Create My Trip"
            )}
          </Button>
        </form>
      </div>
    </div>
    );
  }
);

TripForm.displayName = "TripForm";

export default TripForm;
