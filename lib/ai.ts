import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getWeatherForecast } from "./weather";
import { getCoordinates, buildGoogleFlightsLink, buildBookingLink } from "./utils";

export interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  group?: string;
  budget?: string;
  budgetPerNight?: number;
  interests: string[];
  openaiKey?: string;
}

export async function generateTripPlan(formData: TripFormData) {
  const { destination, startDate, endDate, travelers, group, budget, budgetPerNight, interests } = formData;
  
  // Get coordinates and weather
  const coords = getCoordinates(destination);
  let weatherData: any[] = [];
  
  if (coords) {
    const numDays = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    weatherData = await getWeatherForecast(coords[0], coords[1], startDate, numDays);
  }

  // Calculate budget
  let calculatedBudgetPerNight = budgetPerNight || 200;
  if (budget && !budgetPerNight) {
    const budgetMatch = budget.match(/(\d+)/);
    if (budgetMatch) {
      const budgetNum = Number(budgetMatch[1]);
      if (budget.toLowerCase().includes('k')) {
        const numDays = Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        calculatedBudgetPerNight = Math.round((budgetNum * 1000) / numDays);
      } else {
        calculatedBudgetPerNight = budgetNum;
      }
    }
  }

  const numDays = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Build links
  const googleFlightsLink = buildGoogleFlightsLink(destination, startDate, endDate, "NYC", travelers);
  const bookingMidLink = buildBookingLink(destination, startDate, endDate, travelers);

  const groupDescription = group || `${travelers} ${travelers === 1 ? 'adult' : 'adults'}`;
  const budgetDescription = budget || (calculatedBudgetPerNight ? `$${calculatedBudgetPerNight}/night` : 'mid-range');

  const weatherSummary = weatherData.length > 0
    ? weatherData.map((w, i) => `Day ${i + 1} (${w.date}): ${w.min}–${w.max}°C, ${w.condition}`).join("\n")
    : "Weather data unavailable.";

  // API key setup
  const apiKey = formData.openaiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Please provide an API key in the form or set it in environment variables.");
  }

  if (!apiKey.startsWith('sk-')) {
    throw new Error("Invalid OpenAI API key format. API keys should start with 'sk-'");
  }

  const openaiClient = createOpenAI({
    apiKey,
    baseURL: 'https://api.openai.com/v1',
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 110000);
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options?.headers,
          'User-Agent': 'TripPlanner/1.0',
        },
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  });

  try {
    // Ultra-fast generation with better error handling
    const result = await generateText({
      model: openaiClient("gpt-4o-mini"),
      system: "Return ONLY valid JSON. No markdown.",
      prompt: `Create ${numDays}-day itinerary for ${destination}, ${startDate}, ${groupDescription}, ${budgetDescription}. Weather: ${weatherSummary}. 

Return JSON: {"destination":"${destination}","description":"Brief overview","overview":{"budget":{"total":"$${Math.round((calculatedBudgetPerNight * numDays + 300) * travelers)}"},"transportPass":"Pass recommendation","practicalInfo":["Currency","Tips"]},"places":[{"name":"Main Attraction","type":"landmark","coordinates":[0,0]}],"dates":{"start":"${startDate}","end":"${endDate}"},"travelers":${travelers},"weather":${JSON.stringify(weatherData)},"flights":{"economy":{"airline":"Airline","priceRange":"$600-900","link":"${googleFlightsLink}"}},"hotels":{"midRange":[{"name":"Hotel","priceRange":"$${calculatedBudgetPerNight}","link":"${bookingMidLink}"}]},"itineraries":{"balanced":[]},"tips":["Tip 1"],"costs":{"balanced":{"total":"$${1200 * travelers}"}}}

Make ${numDays + 1} days in balanced array. Each day: {"day":0,"date":"${startDate}","title":"Arrival","activities":[{"time":"2PM","title":"Check-in","location":"Hotel","description":"Arrive and settle","cost":"$0"}],"dailyTotal":"$50"}. Use real places/prices.`,
      temperature: 0.7, // Slightly lower for more consistent results
      maxTokens: 2000, // Slightly higher for complete responses
    });

    let text = result.text?.trim();
    
    if (!text) {
      throw new Error("Empty response from AI service");
    }
    
    // Robust JSON extraction
    let jsonString = text;
    
    // Remove any markdown code blocks
    jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON boundaries more reliably
    const start = jsonString.indexOf("{");
    const end = jsonString.lastIndexOf("}");
    
    if (start === -1 || end === -1 || start >= end) {
      console.error("Invalid JSON boundaries in response:", text.substring(0, 200));
      throw new Error("Invalid response format from AI service");
    }
    
    jsonString = jsonString.substring(start, end + 1);
    
    // Clean up common JSON issues
    jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1"); // Fix trailing commas
    jsonString = jsonString.replace(/\n/g, ' '); // Remove newlines that might break parsing
    jsonString = jsonString.replace(/\s+/g, ' '); // Normalize whitespace
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Problematic JSON:", jsonString.substring(0, 500));
      throw new Error("Invalid JSON response from AI service");
    }
    
    // Validate and ensure required structure
    if (!parsedResult || typeof parsedResult !== 'object') {
      throw new Error("Invalid response structure from AI service");
    }
    
    // Ensure required fields with safe defaults
    const safeResult = {
      destination: parsedResult.destination || destination,
      description: parsedResult.description || `A wonderful trip to ${destination}`,
      overview: parsedResult.overview || {
        budget: { total: `$${Math.round((calculatedBudgetPerNight * numDays + 300) * travelers)}` },
        transportPass: "Local transport passes available",
        practicalInfo: ["Check local currency", "Verify visa requirements"]
      },
      places: Array.isArray(parsedResult.places) ? parsedResult.places : [],
      dates: parsedResult.dates || { start: startDate, end: endDate },
      travelers: parsedResult.travelers || travelers,
      weather: Array.isArray(parsedResult.weather) ? parsedResult.weather : weatherData,
      flights: parsedResult.flights || { economy: { airline: "Major Airlines", priceRange: "$600-900", link: googleFlightsLink } },
      hotels: parsedResult.hotels || { midRange: [{ name: "Recommended Hotels", priceRange: `$${calculatedBudgetPerNight}`, link: bookingMidLink }] },
      itineraries: parsedResult.itineraries || { balanced: [] },
      tips: Array.isArray(parsedResult.tips) ? parsedResult.tips : ["Book accommodations in advance", "Check local weather", "Carry local currency"],
      costs: parsedResult.costs || { balanced: { total: `$${1200 * travelers}` } }
    };
    
    return safeResult;
    
  } catch (error: any) {
    console.error("AI generation error:", error);
    
    // Provide more specific error messages
    if (error.message?.includes("API key")) {
      throw formatOpenAIError(error);
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      throw formatOpenAIError(error);
    } else if (error.message?.includes("timeout") || error.message?.includes("network")) {
      throw new Error("Request timed out. Please try again with a simpler destination or date range.");
    } else {
      throw new Error("Unable to generate trip plan. Please check your API key and try again.");
    }
  }
}

function formatOpenAIError(error: any): Error {
  const errorMessage = error?.message || String(error);
  const errorCode = error?.status || error?.code;
  
  let message = "AI service temporarily unavailable. Please try again.";
  
  if (
    errorMessage?.includes("API key") ||
    errorMessage?.includes("Unauthorized") ||
    errorCode === 401
  ) {
    message = "Check your OpenAI API key (Settings → Env Vars).";
  } else if (
    errorMessage?.includes("insufficient_quota") ||
    errorCode === 402 ||
    errorMessage?.includes("quota")
  ) {
    message = "Out of API credits—add payment in OpenAI dashboard.";
  } else if (
    errorMessage?.includes("network") ||
    errorMessage?.includes("timeout") ||
    errorMessage?.includes("ECONNREFUSED") ||
    errorMessage?.includes("fetch") ||
    errorMessage?.includes("ENOTFOUND") ||
    errorMessage?.includes("ETIMEDOUT") ||
    errorMessage?.includes("connect ECONNREFUSED") ||
    errorMessage?.includes("getaddrinfo ENOTFOUND")
  ) {
    message = "Network connectivity issue. Please check your API key and try again.";
  } else if (
    errorMessage?.includes("rate_limit") ||
    errorCode === 429 ||
    errorMessage?.includes("rate limit")
  ) {
    message = "Rate limited—simplify prompt or wait 1 min.";
  }
  
  return new Error(message);
}
