import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(request: NextRequest) {
  try {
    const { message, tripData } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Build context from trip data if available
    let context = "";
    if (tripData) {
      context = `The user is planning a trip to ${tripData.destination} from ${tripData.dates?.start} to ${tripData.dates?.end} for ${tripData.travelers} traveler(s). `;
      if (tripData.description) {
        context += `Destination description: ${tripData.description}. `;
      }
      if (tripData.places && tripData.places.length > 0) {
        context += `Places of interest include: ${tripData.places.map((p: any) => p.name).join(", ")}. `;
      }
    }

    const prompt = `You are a friendly, enthusiastic, and magical AI travel assistant. Your personality is:
- Warm, helpful, and excited about travel
- Knowledgeable about destinations, culture, food, and experiences
- Enthusiastic but not overwhelming
- Use emojis sparingly but effectively (✨ 🗺️ ✈️ 🏨 🍽️ 🎨 🌟)
- Provide practical, actionable advice
- Be conversational and friendly

${context ? `Context about the user's trip: ${context}` : ""}

User question: ${message}

Provide a helpful, engaging response that feels personal and magical. Keep it concise (2-4 sentences) but informative.`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.8,
      maxTokens: 300,
    });

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}

