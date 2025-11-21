import { NextRequest, NextResponse } from "next/server";
import { generateTripPlan } from "@/lib/ai";

// Use Node.js runtime (not edge) for longer timeouts and dynamic env vars
export const runtime = "nodejs";
// Increase timeout for Vercel (max 60s for Hobby, 300s for Pro)
// Set to 120s to match client timeout - requires Vercel Pro plan for >60s
export const maxDuration = 120; // 2 minutes - requires Pro plan

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.destination || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: "Missing required fields: destination, startDate, or endDate" },
        { status: 400 }
      );
    }
    
    // Validate API key exists (either from form or env)
    const apiKey = body.openaiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is required. Please provide it in the form or set OPENAI_API_KEY environment variable." },
        { status: 400 }
      );
    }

    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key format. API keys should start with 'sk-'" },
        { status: 400 }
      );
    }
    
    console.log("Generating trip plan for:", body.destination);
    console.log("API key present:", !!apiKey, "Length:", apiKey?.length);
    
    const result = await generateTripPlan(body);
    console.log("Trip plan generated successfully");
    
    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Trip generation error:", error);
    console.error("Error stack:", error.stack);
    
    // Extract friendly error message (already formatted by formatOpenAIError)
    let errorMessage = error?.message || "Failed to generate trip plan";
    let statusCode = 500;
    
    // Determine status code based on error type
    if (
      errorMessage.includes("API key") ||
      errorMessage.includes("Check your OpenAI API key") ||
      errorMessage.includes("OPENAI_API_KEY")
    ) {
      statusCode = 400;
    } else if (
      errorMessage.includes("Rate limited") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("quota")
    ) {
      statusCode = 429;
    } else if (
      errorMessage.includes("Internet issue") ||
      errorMessage.includes("network") ||
      errorMessage.includes("fetch") ||
      errorMessage.includes("Network connectivity issue") ||
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("ETIMEDOUT") ||
      errorMessage.includes("ECONNREFUSED")
    ) {
      statusCode = 503;
    } else if (errorMessage.includes("timeout") || errorMessage.includes("aborted")) {
      statusCode = 504;
    }
    
    // Ensure errorMessage is always a string (never [object Object])
    if (typeof errorMessage !== "string") {
      errorMessage = String(errorMessage);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
