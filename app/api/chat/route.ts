import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, tripData, context } = await req.json();

    const systemPrompt = `You are an AI travel assistant with the power to modify trip itineraries. Your goal is to help users with their trip planning and make real-time changes.
        ${
          tripData
            ? `The user is currently planning a trip to ${tripData.destination} from ${tripData.dates?.start} to ${tripData.dates?.end} for ${tripData.travelers || 2} people.
            Their budget for accommodation is around $${tripData.budgetPerNight || 200} per night.
            Their interests include: ${tripData.interests?.join(", ") || "general travel"}.
            ${tripData.weather ? `The weather forecast for their trip is: ${tripData.weather
              .map((w: any) => `${w.date}: ${w.min}°C-${w.max}°C, ${w.condition}`)
              .join("; ")}.` : ""}
            
            IMPORTANT: You can regenerate specific days or the entire plan. When users say things like:
            - "Change Day 3 to beaches" → You should acknowledge and suggest regenerating Day 3
            - "I don't like Day 2" → Offer to regenerate that day
            - "Regenerate full plan" → Offer to regenerate everything
            
            You can provide information about:
            - Attractions and activities in ${tripData.destination}
            - Local cuisine and restaurants
            - Transportation options
            - Cultural tips
            - Weather-appropriate packing advice
            - Modifying specific days or activities
            
            Keep your responses concise and helpful, leveraging the provided trip context.
            `
            : "The user has not yet generated a trip plan. Offer general travel advice or ask them about their desired destination, dates, and interests."
        }
        `;

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      maxTokens: 500,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
