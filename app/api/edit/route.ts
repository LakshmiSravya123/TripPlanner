import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import pRetry from "p-retry";
import { buildEditPrompt, itinerarySchema, type EditItineraryInput, type ItineraryData } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 120;

interface EditBody {
  itinerary: ItineraryData;
  userRequest: string;
  day?: number;
  openaiKey?: string;
}

function validateBody(body: any): body is EditBody {
  return (
    body &&
    typeof body.userRequest === "string" &&
    body.itinerary &&
    typeof body.itinerary === "object"
  );
}

function extractAndParseJson(text: string): ItineraryData {
  // Kept only as a type guard in case we ever need it; not used after switching to generateObject.
  const jsonString = text.trim();
  const parsed = JSON.parse(jsonString);
  return parsed as ItineraryData;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!validateBody(body)) {
      return NextResponse.json(
        { error: "Missing or invalid fields: itinerary, userRequest" },
        { status: 400 }
      );
    }

    const { itinerary, userRequest, day } = body as EditBody;

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

    const input: EditItineraryInput = {
      itinerary,
      userRequest,
      day,
    };

    const prompt = buildEditPrompt(input);

    const updatedItinerary = await pRetry(
      async () => {
        const { object } = await generateObject({
          model: openaiClient("gpt-4o-mini"),
          temperature: 0.3,
          maxTokens: 800,
          system:
            "You are Grok, an expert travel editor AI. You create detailed travel itineraries and must follow the provided JSON schema exactly.",
          prompt,
          schema: itinerarySchema,
        });

        if (!object) {
          throw new Error("Empty response from AI");
        }

        return object;
      },
      {
        retries: 0,
      }
    );

    let updated = updatedItinerary as ItineraryData;

    if (!updated || typeof updated !== "object") {
      throw new Error("AI returned invalid structure");
    }

    if (!Array.isArray(updated.days)) {
      updated.days = [];
    }
    if (!Array.isArray(updated.tips)) {
      updated.tips = [];
    }

    return NextResponse.json(
      { itinerary: updated },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("/api/edit error", error);
    const message = typeof error?.message === "string" ? error.message : "Failed to edit itinerary";

    let status = 500;
    if (message.includes("API key")) status = 400;
    else if (message.includes("rate limit") || message.includes("quota")) status = 429;

    return NextResponse.json({ error: message }, { status });
  }
}
