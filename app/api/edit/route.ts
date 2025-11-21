import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import pRetry from "p-retry";
import { buildEditPrompt, type EditItineraryInput, type ItineraryData } from "@/lib/prompt";

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
  let jsonString = text.trim();
  jsonString = jsonString.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

  const start = jsonString.indexOf("{");
  const end = jsonString.lastIndexOf("}");
  if (start === -1 || end === -1 || start >= end) {
    throw new Error("No JSON object found in AI response");
  }

  jsonString = jsonString.substring(start, end + 1);

  let prevLength: number;
  do {
    prevLength = jsonString.length;
    jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1");
  } while (jsonString.length !== prevLength);

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

    const result = await pRetry(
      async () => {
        const { text } = await generateText({
          model: openaiClient("gpt-4o-mini"),
          temperature: 0.6,
          maxTokens: 2000,
          system:
            "You are Grok, an expert travel editor AI. You MUST return only strict JSON, no commentary, no markdown.",
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

    let updated = extractAndParseJson(result);

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
