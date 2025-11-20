import { NextRequest, NextResponse } from "next/server";
import { generateTripPlan } from "@/lib/ai";

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
    
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables." },
        { status: 500 }
      );
    }
    
    console.log("Generating trip plan for:", body.destination);
    const result = await generateTripPlan(body);
    console.log("Trip plan generated successfully");
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Trip generation error:", error);
    console.error("Error stack:", error.stack);
    
    // Provide more specific error messages
    let errorMessage = error.message || "Failed to generate trip plan";
    
    if (errorMessage.includes("API key")) {
      errorMessage = "OpenAI API key is invalid or missing. Please check your .env.local file.";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      errorMessage = "OpenAI API rate limit exceeded or quota reached. Please check your OpenAI account.";
    } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      errorMessage = "Network error. Please check your internet connection and try again.";
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
