import { NextRequest, NextResponse } from "next/server";
import { generateTripPlan } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await generateTripPlan(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Trip generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate trip plan" },
      { status: 500 }
    );
  }
}
