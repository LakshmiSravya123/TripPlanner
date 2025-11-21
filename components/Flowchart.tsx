"use client";

import ItineraryFlowchart from "@/components/itinerary/ItineraryFlowchart";

interface FlowchartDay {
  day: number;
  date: string;
  title?: string;
  activities?: any[];
}

interface FlowchartProps {
  days: FlowchartDay[];
  onReorderDays?: (order: number[]) => void;
}

export default function Flowchart({ days, onReorderDays }: FlowchartProps) {
  const itineraries = { balanced: days };
  return (
    <ItineraryFlowchart
      itineraries={itineraries}
      activeTab="balanced"
      onReorderDays={onReorderDays}
    />
  );
}
