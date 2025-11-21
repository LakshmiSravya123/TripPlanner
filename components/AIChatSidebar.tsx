"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageCircle, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { ItineraryData } from "@/lib/prompt";

interface AIChatSidebarProps {
  itinerary: ItineraryData;
  meta: {
    destination: string;
    startDate: string;
    duration: number;
    travelersDescription: string;
    budgetLevel: string;
    pace: string;
  };
  onUpdate: (updated: ItineraryData) => void;
}

export default function AIChatSidebar({ itinerary, meta, onUpdate }: AIChatSidebarProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("all");

  const dayOptions = useMemo(() => {
    if (!Array.isArray(itinerary.days)) return [];
    return itinerary.days
      .map((day) => (typeof day.day === "number" ? day.day : undefined))
      .filter((d): d is number => typeof d === "number");
  }, [itinerary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const dayNumber = selectedDay === "all" ? undefined : Number(selectedDay) || undefined;

      const response = await fetch("/api/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          itinerary,
          userRequest: trimmed,
          day: dayNumber,
        }),
      });

      if (!response.ok) {
        let errorText = "";
        try {
          const errorData = await response.json();
          errorText = typeof errorData.error === "string" ? errorData.error : `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorText = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorText);
      }

      const json = await response.json();
      if (!json || !json.itinerary) {
        throw new Error("Server returned an incomplete edited itinerary.");
      }

      onUpdate(json.itinerary as ItineraryData);
      setInput("");
      toast.success("Itinerary updated");
    } catch (error: any) {
      const message = typeof error?.message === "string" ? error.message : "Failed to update itinerary";
      toast.error("Failed to update itinerary", {
        description: message,
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  const subtitle = `${meta.duration} days • ${meta.travelersDescription} • ${meta.budgetLevel} • ${meta.pace}`;

  return (
    <aside className="bg-white/5 border border-white/20 rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-sm md:text-base font-semibold text-white">AI Trip Tuner</h2>
          <p className="text-xs text-purple-100 line-clamp-2">Tell Grok how to tweak your plan</p>
        </div>
      </div>

      <div className="mb-4 text-xs text-purple-100">
        <div className="font-semibold">{meta.destination}</div>
        <div className="opacity-80 line-clamp-2">{subtitle}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
        <div className="text-xs text-purple-100 flex items-center justify-between gap-2">
          <span>Scope</span>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-[11px] text-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
          >
            <option value="all">Whole trip</option>
            {dayOptions.map((day) => (
              <option key={day} value={String(day)}>
                Only Day {day}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Make Day 5 more relaxed, swap in a beach afternoon, and keep dinner vegetarian."
            className="w-full h-32 md:h-full min-h-[120px] max-h-[260px] rounded-2xl bg-white/10 border border-white/20 text-xs md:text-sm text-purple-50 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/60 placeholder:text-purple-200/70"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white text-xs md:text-sm font-semibold px-4 py-2 shadow-lg hover:shadow-xl hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating itinerary...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Ask Grok to edit
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-[10px] text-purple-100/80 space-y-1">
        <div className="font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Examples
        </div>
        <ul className="space-y-1">
          <li>Make the last day slower with more cafes and fewer museums.</li>
          <li>Cheaper dinner options on Day 3, all vegetarian.</li>
          <li>Move Kyoto to Day 2 and fix the trains accordingly.</li>
        </ul>
      </div>
    </aside>
  );
}
