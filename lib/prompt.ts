import { differenceInCalendarDays, format } from "date-fns";
import { z } from "zod";

export interface ItineraryActivity {
  time: string;
  activity: string;
  cost: string;
  duration?: string;
  transport?: string;
  note?: string;
  veggieTip?: string;
}

export interface ItineraryDay {
  day: number;
  date: string; // ISO string or human-readable date
  weekday: string;
  city: string;
  weather: string;
  dailyTotal: string;
  activities: ItineraryActivity[];
}

export interface ItineraryOverview {
  title: string;
  duration: string;
  route: string;
  budgetBreakdown: string;
  transport: string;
}

export interface ItineraryData {
  overview: ItineraryOverview;
  days: ItineraryDay[];
  tips: string[];
}

export const itineraryActivitySchema = z.object({
  time: z.string().optional().default(""),
  activity: z.string().optional().default(""),
  cost: z.string().optional().default(""),
  duration: z.string().optional().default(""),
  transport: z.string().optional().default(""),
  note: z.string().optional().default(""),
  veggieTip: z.string().optional().default(""),
});

export const itineraryDaySchema = z.object({
  day: z.number().int().positive().optional(),
  date: z.string().optional().default(""),
  weekday: z.string().optional().default(""),
  city: z.string().optional().default(""),
  weather: z.string().optional().default(""),
  dailyTotal: z.string().optional().default(""),
  activities: z.array(itineraryActivitySchema).optional().default([]),
});

export const itineraryOverviewSchema = z.object({
  title: z.string().optional().default(""),
  duration: z.string().optional().default(""),
  route: z.string().optional().default(""),
  budgetBreakdown: z.string().optional().default(""),
  transport: z.string().optional().default(""),
});

export const itinerarySchema = z.object({
  overview: itineraryOverviewSchema.optional().default({
    title: "",
    duration: "",
    route: "",
    budgetBreakdown: "",
    transport: "",
  }),
  days: z.array(itineraryDaySchema).optional().default([]),
  tips: z.array(z.string()).optional().default([]),
});

export interface GenerateItineraryInput {
  destination: string;
  startDate: string; // ISO date
  duration: number;
  travelers: string; // e.g. "2 adults vegetarian"
  budget: string; // e.g. "Mid", "Low", etc.
  pace: string; // Relaxed / Balanced / Packed
}

export interface EditItineraryInput {
  itinerary: ItineraryData;
  userRequest: string;
  day?: number; // optional specific day to target
}

export function computeEndDate(startDate: string, duration: number): string {
  try {
    const end = new Date(startDate);
    end.setDate(end.getDate() + Math.max(duration - 1, 0));
    return format(end, "yyyy-MM-dd");
  } catch {
    return startDate;
  }
}

export function inferDuration(startDate: string, endDate: string): number {
  try {
    const d = differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1;
    return Math.max(d, 1);
  } catch {
    return 7;
  }
}

export function buildGeneratePrompt(input: GenerateItineraryInput): string {
  const { destination, startDate, duration, travelers, budget, pace } = input;

  return `You are Grok, a genius travel AI. Generate a hyper-detailed, realistic itinerary for ${travelers} visiting ${destination} for ${duration} days starting ${startDate}.
Budget: ${budget}, Pace: ${pace}.
Return ONLY valid JSON with this structure:
{
"overview": {
  "title": "Your ${destination} Adventure",
  "duration": "${duration} days",
  "route": "Tokyo → Kyoto → Osaka",
  "budgetBreakdown": "Total ~$2,400 | Flights $900 | Hotels $800 | Food $400 | Activities $300",
  "transport": "7-day JR Pass + local subway"
},
"days": [
  {
    "day": 1,
    "date": "2025-11-21",
    "weekday": "Fri",
    "city": "Tokyo",
    "weather": "16°C ☁ | Mild autumn",
    "dailyTotal": "$185",
    "activities": [
      {
        "time": "9:00 AM",
        "activity": "Meiji Shrine & Yoyogi Park",
        "cost": "$0",
        "duration": "2h",
        "transport": "JR Yamanote Line",
        "note": "Peak ginkgo season — golden tunnel photos!",
        "veggieTip": "Try mushroom soba at nearby stall"
      }
    ]
  }
],
"tips": ["Use Suica card", "Download Google Translate", "Bring portable Wi-Fi"]
}
Rules (STRICT JSON):
- Output must be a single valid JSON object only.
- Do NOT include comments of any kind (no // or /* */).
- Do NOT include trailing commas.
- Do NOT include any text before or after the JSON.
- The JSON block above is only an example template. You MUST replace all values with accurate data for the actual trip requested: ${destination}, ${duration} days starting ${startDate}, and the given travelers, budget and pace.
- NEVER use generic phrases like "explore local attractions".
- Include real 2025 prices, events, weather, vegetarian options.
- No "Why Visit", no maps, no fluff.
- Make it witty, helpful, and perfectly paced.`;
}

export function buildEditPrompt(input: EditItineraryInput): string {
  const { itinerary, userRequest, day } = input;
  const scope =
    typeof day === "number"
      ? `Revise only Day ${day} of this itinerary based on the user request. Keep all other days exactly the same.\n\n`
      : "Revise only the minimal necessary parts of this itinerary based on the user request. Preserve structure and dates.\n\n";

  const json = JSON.stringify(itinerary);

  return `${scope}Itinerary JSON:\n${json}\n\nUser request: ${userRequest}\n\nReturn ONLY the full updated itinerary JSON in the same structure (overview, days[], tips[]).`;
}
