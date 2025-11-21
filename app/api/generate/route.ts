import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import pRetry from "p-retry";
import { buildGeneratePrompt, computeEndDate, type GenerateItineraryInput, type ItineraryData } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 120;

interface GenerateBody {
  destination: string;
  startDate: string;
  duration: number;
  travelersDescription: string;
  budgetLevel: string;
  pace: string;
  openaiKey?: string;
}

function validateBody(body: any): body is GenerateBody {
  return (
    typeof body?.destination === "string" &&
    typeof body?.startDate === "string" &&
    typeof body?.duration === "number" &&
    body.duration > 0 &&
    typeof body?.travelersDescription === "string" &&
    typeof body?.budgetLevel === "string" &&
    typeof body?.pace === "string"
  );
}

function extractAndParseJson(text: string): ItineraryData {
  let jsonString = text.trim();

  // Strip markdown fences if present
  jsonString = jsonString.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

  const start = jsonString.indexOf("{");
  const end = jsonString.lastIndexOf("}");
  if (start === -1 || end === -1 || start >= end) {
    throw new Error("No JSON object found in AI response");
  }

  jsonString = jsonString.substring(start, end + 1);

  // Remove trailing commas
  let prevLength: number;
  do {
    prevLength = jsonString.length;
    jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1");
  } while (jsonString.length !== prevLength);

  // Remove invalid control characters
  jsonString = jsonString.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  try {
    const parsed = JSON.parse(jsonString);
    return parsed as ItineraryData;
  } catch (err: any) {
    throw new Error(`Invalid JSON from AI: ${err.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!validateBody(body)) {
      return NextResponse.json(
        { error: "Missing or invalid fields: destination, startDate, duration, travelersDescription, budgetLevel, pace" },
        { status: 400 }
      );
    }

    const { destination, startDate, duration, travelersDescription, budgetLevel, pace } = body as GenerateBody;

    const userKey = body.openaiKey?.trim();
    const envKey = process.env.OPENAI_API_KEY?.trim();
    const apiKey = userKey || envKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is required. Provide it in the form or set OPENAI_API_KEY env var." },
        { status: 400 }
      );
    }

    if (!apiKey.startsWith("sk-")) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key format. Keys must start with 'sk-'" },
        { status: 400 }
      );
    }

    if (apiKey.length < 20) {
      return NextResponse.json(
        { error: "API key appears too short. Please double-check your key." },
        { status: 400 }
      );
    }

    const openaiClient = createOpenAI({
      apiKey,
      baseURL: "https://api.openai.com/v1",
    });

    const input: GenerateItineraryInput = {
      destination,
      startDate,
      duration,
      travelers: travelersDescription,
      budget: budgetLevel,
      pace,
    };

    const prompt = buildGeneratePrompt(input);

    const result = await pRetry(
      async () => {
        const { text } = await generateText({
          model: openaiClient("gpt-4o-mini"),
          temperature: 0.6,
          maxTokens: 2000,
          system:
            "You are Grok, a witty but precise travel planning AI. You MUST return only strict JSON, no commentary, no markdown.",
          prompt,
        });

        if (!text) {
          throw new Error("Empty response from AI");
        }

        return text;
      },
      {
        retries: 2,
      }
    );

    let itinerary = extractAndParseJson(result);

    // Ensure required structure with safe fallbacks
    if (!itinerary || typeof itinerary !== "object") {
      throw new Error("AI returned invalid structure");
    }

    if (!Array.isArray(itinerary.days)) {
      itinerary.days = [];
    }

    if (!Array.isArray(itinerary.tips)) {
      itinerary.tips = [];
    }

    // Basic normalization of days
    itinerary.days = itinerary.days.map((day, index) => ({
      day: day.day ?? index + 1,
      date: day.date || startDate,
      weekday: day.weekday || "",
      city: day.city || destination,
      weather: day.weather || "",
      dailyTotal: day.dailyTotal || "",
      activities: Array.isArray(day.activities) ? day.activities : [],
    }));

    // Ensure overview
    itinerary.overview = itinerary.overview || {
      title: `Your ${destination} Adventure`,
      duration: `${duration} days`,
      route: destination,
      budgetBreakdown: "", 
      transport: "",
    };

    const endDate = computeEndDate(startDate, duration);

    return NextResponse.json(
      {
        itinerary,
        meta: {
          destination,
          startDate,
          endDate,
          duration,
          travelersDescription,
          budgetLevel,
          pace,
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("/api/generate error", error);
    const message = typeof error?.message === "string" ? error.message : "Failed to generate itinerary";

    let status = 500;
    if (message.includes("API key")) status = 400;
    else if (message.includes("rate limit") || message.includes("quota")) status = 429;

    return NextResponse.json({ error: message }, { status });
  }
}
