import { NextRequest, NextResponse } from "next/server";
import { generateTripPlan } from "@/lib/ai";

// Use Node.js runtime (not edge) for longer timeouts and dynamic env vars
export const runtime = "nodejs";
// Increase timeout for Vercel (max 60s for Hobby, 300s for Pro)
export const maxDuration = 120; // 2 minutes - more reasonable timeout

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
    
    // Provide more specific error messages
    let errorMessage = error.message || "Failed to generate trip plan";
    let statusCode = 500;
    
    if (errorMessage.includes("API key") || errorMessage.includes("OPENAI_API_KEY")) {
      errorMessage = "OpenAI API key is invalid or missing. Please check your API key in the form or environment variables.";
      statusCode = 400;
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("quota") || errorMessage.includes("insufficient_quota")) {
      errorMessage = "OpenAI API rate limit exceeded or quota reached. Please check your OpenAI account and add credits.";
      statusCode = 429;
    } else if (errorMessage.includes("network") || errorMessage.includes("fetch") || errorMessage.includes("ECONNREFUSED")) {
      errorMessage = "Network error. Please check your internet connection and try again.";
      statusCode = 503;
    } else if (errorMessage.includes("timeout") || errorMessage.includes("aborted")) {
      errorMessage = "Request timed out. The trip generation is taking too long. Please try again with a simpler request.";
      statusCode = 504;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
