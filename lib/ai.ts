import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import pRetry from "p-retry";
import { getWeatherForecast } from "./weather";
import { getCoordinates, buildGoogleFlightsLink, buildBookingLink } from "./utils";
import { getPlaceCoordinates } from "./places";
import { searchCurrentPrice, searchTravelInfo } from "./web-search";

export interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  group?: string; // e.g., "2 adults vegetarian"
  budget?: string; // e.g., "mid ¥200k"
  budgetPerNight?: number; // For backward compatibility
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

  // Calculate budgetPerNight from budget string if needed
  let calculatedBudgetPerNight = budgetPerNight || 200;
  if (budget && !budgetPerNight) {
    // Try to extract number from budget string (e.g., "mid ¥200k" -> 200)
    const budgetMatch = budget.match(/(\d+)/);
    if (budgetMatch) {
      const budgetNum = Number(budgetMatch[1]);
      // If it's in thousands (k), divide by days to get per night
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
  ) + 1;

  // Build booking links
  const googleFlightsLink = buildGoogleFlightsLink(destination, startDate, endDate, "NYC", travelers);
  const bookingBudgetLink = buildBookingLink(destination, startDate, endDate, travelers, Math.round(calculatedBudgetPerNight * 0.7));
  const bookingMidLink = buildBookingLink(destination, startDate, endDate, travelers, Math.round(calculatedBudgetPerNight * 1.2));
  const bookingLuxuryLink = buildBookingLink(destination, startDate, endDate, travelers);

  const weatherSummary = weatherData.length > 0
    ? weatherData.map((w, i) => `Day ${i + 1} (${w.date}): ${w.min}–${w.max}°C, ${w.condition}`).join("\n")
    : "Weather data unavailable. Using general seasonal guidance.";

  // Skip web searches to speed up generation - they're not critical and slow things down
  // The AI model has knowledge of current prices and events
  let jrPassInfo = '';
  let currentEvents = '';
  let currentPrices = '';
  
  // Don't wait for web searches - start AI generation immediately
  // Web searches can run in background but we won't wait for them
  if (destination.toLowerCase().includes('japan')) {
    searchCurrentPrice('JR Pass', 'Japan').then(result => { jrPassInfo = result; }).catch(() => {});
  }
  searchTravelInfo(destination, 'current events 2025').then(result => { currentEvents = result; }).catch(() => {});
  searchTravelInfo(destination, 'current prices 2025').then(result => { currentPrices = result; }).catch(() => {});

  const groupDescription = group || `${travelers} ${travelers === 1 ? 'adult' : 'adults'}`;
  const budgetDescription = budget || (calculatedBudgetPerNight ? `$${calculatedBudgetPerNight}/night` : 'mid-range');

  // Simplified, faster prompt - like Grok
  const prompt = `Create a detailed ${numDays}-day travel itinerary for ${destination} starting ${startDate} for ${groupDescription}. Budget: ${budgetDescription}. Interests: ${interests.join(", ") || "General travel"}.

Weather: ${weatherSummary}

Return ONLY valid JSON (no markdown, no extra text). Structure:
{
  "destination": "${destination}",
  "description": "Brief overview",
  "overview": {
    "budget": {"accommodation": "$${Math.round(calculatedBudgetPerNight * numDays)}", "food": "$50-100/day", "transport": "$100-200", "activities": "$200-400", "total": "$${Math.round((calculatedBudgetPerNight * numDays + 350) * travelers)}"},
    "transportPass": "Recommendation with cost",
    "practicalInfo": ["Currency", "Tipping", "SIM/Wi-Fi"]
  },
  "places": [{"name": "Place", "description": "Brief", "type": "landmark", "coordinates": [lon, lat]}],
  "dates": {"start": "${startDate}", "end": "${endDate}"},
  "travelers": ${travelers},
  "weather": ${JSON.stringify(weatherData)},
  "flights": {"economy": {"priceRange": "$600-900", "link": "${googleFlightsLink}"}},
  "hotels": {"budget": [{"name": "Hotel", "priceRange": "$${Math.round(calculatedBudgetPerNight * 0.7)}", "link": "${bookingBudgetLink}"}], "midRange": [{"name": "Hotel", "priceRange": "$${Math.round(calculatedBudgetPerNight * 1.2)}", "link": "${bookingMidLink}"}], "luxury": [{"name": "Hotel", "priceRange": "$${Math.round(calculatedBudgetPerNight * 1.8)}", "link": "${bookingLuxuryLink}"}]},
  "itineraries": {
    "balanced": [{"day": 0, "date": "${startDate}", "title": "Arrival", "activities": [{"time": "9AM-12PM", "title": "Activity", "location": "Place", "description": "Details", "transportation": "Method", "cost": "$50"}]}]
  },
  "tips": ["Tip 1", "Tip 2"],
  "costs": {"balanced": {"perPerson": "$1200-1800", "total": "$${1200 * travelers}-$${1800 * travelers}"}}
}

RULES:
- ${numDays + 1} days total (Day 0 arrival + ${numDays} full days)
- Each activity: time, title, location, description, transportation, cost
- Use REAL prices and specific place/restaurant names
- Include dailyTotal for each day
- NO generic placeholders

Return this exact JSON structure:
{
  "destination": "${destination}",
  "description": "A brief 1-2 sentence overview of ${destination}",
  "overview": {
    "budget": {
      "accommodation": "$${Math.round(calculatedBudgetPerNight * numDays)}-$${Math.round(calculatedBudgetPerNight * 1.2 * numDays)}",
      "food": "$X-XX per day",
      "transport": "$X-XX (include pass recommendations)",
      "activities": "$X-XX",
      "total": "$X,XXX-XX,XXX"
    },
    "transportPass": "Specific pass recommendation (e.g., '7-day JR Pass - activate on Day 4', 'City Tourist Card', etc.)",
    "practicalInfo": ["Currency: XXX", "Tipping: Info", "SIM/Wi-Fi: Recommendation", "Other practical tips"]
  },
  "places": [
    {"name": "Famous Landmark Name", "description": "Brief description", "type": "landmark", "coordinates": [longitude, latitude]},
    {"name": "Cultural Site Name", "description": "Brief description", "type": "culture", "coordinates": [longitude, latitude]},
    {"name": "Natural Attraction Name", "description": "Brief description", "type": "nature", "coordinates": [longitude, latitude]}
  ],
  "dates": {"start": "${startDate}", "end": "${endDate}"},
  "travelers": ${travelers},
  "weather": ${JSON.stringify(weatherData)},
  "flights": {
    "economy": {"airline": "Major Airline", "priceRange": "$600-900", "duration": "8h 30m", "link": "${googleFlightsLink}"},
    "comfort": {"airline": "Major Airline", "priceRange": "$900-1200", "duration": "8h 30m", "link": "${googleFlightsLink}"},
    "premium": {"airline": "Major Airline", "priceRange": "$1200-1800", "duration": "8h 30m", "link": "${googleFlightsLink}"}
  },
  "hotels": {
    "budget": [{"name": "Budget Hotel", "location": "City Center", "priceRange": "$${Math.round(calculatedBudgetPerNight * 0.7)}-$${Math.round(calculatedBudgetPerNight * 0.9)}", "rating": 4.2, "link": "${bookingBudgetLink}"}],
    "midRange": [{"name": "Mid-Range Hotel", "location": "City Center", "priceRange": "$${Math.round(calculatedBudgetPerNight * 1.1)}-$${Math.round(calculatedBudgetPerNight * 1.3)}", "rating": 4.6, "link": "${bookingMidLink}"}],
    "luxury": [{"name": "Luxury Hotel", "location": "Prime Location", "priceRange": "$${Math.round(calculatedBudgetPerNight * 1.5)}-$${Math.round(calculatedBudgetPerNight * 2)}", "rating": 4.8, "link": "${bookingLuxuryLink}"}]
  },
  "itineraries": {
    "economic": [],
    "balanced": [],
    "luxury": []
  },
  "tips": [
    "Booking recommendation 1",
    "Best times to visit tip",
    "Money-saving tip",
    "Cultural note",
    "Current event/seasonal consideration"
  ],
  "costs": {
    "economic": {"perPerson": "$800-1200", "total": "$${800 * travelers}-$${1200 * travelers}"},
    "balanced": {"perPerson": "$1200-1800", "total": "$${1200 * travelers}-$${1800 * travelers}"},
    "luxury": {"perPerson": "$2000-3000", "total": "$${2000 * travelers}-$${3000 * travelers}"}
  }
}

IMPORTANT RULES:
1. Return ONLY the JSON object, nothing else - NO markdown, NO extra text
2. No trailing commas in arrays or objects
3. All strings must be properly escaped (use \\n for newlines in descriptions)
4. Create ${numDays + 1} days total (Day 0 for arrival + ${numDays} full days) for EACH itinerary tier (economic, balanced, luxury)
5. Each day must have: day (number), date (YYYY-MM-DD), title (e.g., "Tokyo Arrival & Urban Buzz", "Historic Tokyo"), activities (array)
6. Each activity MUST have: time (e.g., "9AM–12PM", "1–5PM"), title, location, description, transportation (specific method with duration/cost), cost (in local currency like ¥1,500 or $50), tips (optional)
7. Include "dailyTotal" field for each day showing transport + activities + food costs in local currency
8. Use REALISTIC prices in local currency - research actual current prices (e.g., ¥2,400 for Shibuya Sky, ¥1,500 for lunch)
9. Include specific restaurant names (e.g., "Ain Soph", "Ichiran", "Torikyu"), actual attraction names, real locations
10. Transportation must be specific: "Shinkansen Tokyo → Odawara (35 min, ¥3,000)" or "Airport train (~¥1,200)" not just "train"
11. Weather-aware: suggest indoor alternatives if rain forecasted (e.g., "Alt: Rainy? Swap for indoor Sumida Aquarium (¥2,300)")
12. Keep pacing realistic - 3-5 activities per day max with specific time ranges
13. Include vegetarian options if interests include vegetarian/vegan - name specific restaurants
14. NO "inspiration" or "why visit" sections - focus on actionable itinerary only
15. Overview section must include: route (city progression), transport pass details with costs, budget breakdown in local currency
16. ABSOLUTELY NO GENERIC PLACEHOLDERS - every activity must have real names, real prices, real times
17. Format activities like the example: "9AM–12PM: [Activity] ([cost]; [details]). [Next activity] ([cost])."

Return the JSON now:`;

  // Use provided key or fallback to environment variable
  const apiKey = formData.openaiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Please provide an API key in the form or set it in environment variables.");
  }

  // Validate API key format
  if (!apiKey.startsWith('sk-')) {
    throw new Error("Invalid OpenAI API key format. API keys should start with 'sk-'");
  }

  const openaiClient = createOpenAI({
    apiKey,
    baseURL: 'https://api.openai.com/v1',
    fetch: (url, options) => {
      // Add timeout and better error handling for Vercel
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 110000); // 110s timeout (just under 120s max)
      
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
    // Simplified, fast generation - no retries, no generic checks
    let text: string;
    
    // Single attempt with optimized prompt for speed
    const result = await generateText({
      model: openaiClient("gpt-4o-mini"),
      system: "You are a JSON-only travel itinerary generator. Return ONLY valid JSON. No markdown, no explanations. Start with { and end with }.",
      prompt: prompt,
      temperature: 0.4, // Slightly higher for faster generation
      maxTokens: 4000, // Reduced for speed - enough for detailed itinerary
    });
    
    text = result.text;
    
    if (!text || text.trim().length === 0) {
      throw new Error("No response from AI");
    }

    // Clean and parse JSON response
    let jsonText = text.trim();
    
    // Log the raw response for debugging (first 1000 chars)
    console.log("Raw AI response (first 1000 chars):", jsonText.substring(0, 1000));
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    
    // Remove any text before the first {
    const firstBrace = jsonText.indexOf("{");
    if (firstBrace > 0) {
      jsonText = jsonText.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = jsonText.lastIndexOf("}");
    if (lastBrace !== -1 && lastBrace < jsonText.length - 1) {
      jsonText = jsonText.substring(0, lastBrace + 1);
    }
    
    // Find JSON object - try multiple patterns
    let jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Try to find JSON after "Return the JSON now:" or similar
      const jsonStart = jsonText.indexOf("{");
      if (jsonStart !== -1) {
        jsonMatch = [jsonText.substring(jsonStart)];
      }
    }
    
    if (!jsonMatch) {
      console.error("No JSON found. Full response text:", text);
      throw new Error("No valid JSON found in AI response. The AI may have returned text instead of JSON. Please try again.");
    }
    
    let jsonString = jsonMatch[0];
    
    // Fix common JSON issues
    // Remove trailing commas before closing brackets/braces (multiple passes)
    for (let i = 0; i < 5; i++) {
      jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1");
    }
    
    // Remove any comments
    jsonString = jsonString.replace(/\/\/.*$/gm, "");
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, "");
    
    // Fix unescaped newlines in strings - be more careful
    // Replace newlines inside string values with \n
    jsonString = jsonString.replace(/([^\\])"([^"]*)\n([^"]*)"/g, '$1"$2\\n$3"');
    
    // Fix control characters (but keep \n and \t)
    jsonString = jsonString.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    
    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (parseError: any) {
      const errorPos = parseInt(parseError.message.match(/position (\d+)/)?.[1] || "0");
      console.error("JSON Parse Error:", parseError.message);
      console.error("Error position:", errorPos);
      console.error("JSON around error:", jsonString.substring(Math.max(0, errorPos - 200), errorPos + 200));
      console.error("Full JSON length:", jsonString.length);
      console.error("Full JSON (first 2000 chars):", jsonString.substring(0, 2000));
      
      // Try one more aggressive fix - remove problematic characters
      let fixedJson = jsonString;
      
      // Try to fix unclosed strings or arrays
      // Count brackets and braces to find imbalance
      const openBraces = (fixedJson.match(/\{/g) || []).length;
      const closeBraces = (fixedJson.match(/\}/g) || []).length;
      const openBrackets = (fixedJson.match(/\[/g) || []).length;
      const closeBrackets = (fixedJson.match(/\]/g) || []).length;
      
      // Add missing closing brackets if needed
      if (openBraces > closeBraces) {
        fixedJson += "}".repeat(openBraces - closeBraces);
      }
      if (openBrackets > closeBrackets) {
        fixedJson += "]".repeat(openBrackets - closeBrackets);
      }
      
      try {
        result = JSON.parse(fixedJson);
      } catch (retryError: any) {
        // Last resort: throw error instead of using generic fallback
        console.error("All JSON parsing attempts failed. Full response:", text.substring(0, 1000));
        throw new Error("Failed to parse AI response. The AI may have returned invalid JSON. Please try again.");
      }
    }
    
    if (result) {
      // Ensure weather data is preserved correctly (AI might modify it)
      if (weatherData.length > 0 && (!result.weather || result.weather.length === 0)) {
        result.weather = weatherData;
      } else if (result.weather && weatherData.length > 0) {
        // Merge weather data to ensure all fields are present
        result.weather = result.weather.map((w: any, i: number) => ({
          ...weatherData[i],
          ...w,
          condition: w.condition || weatherData[i]?.condition || "Unknown",
          date: w.date || weatherData[i]?.date,
          min: w.min ?? weatherData[i]?.min ?? 0,
          max: w.max ?? weatherData[i]?.max ?? 0,
        }));
      }
      
      // Ensure places have proper structure and add coordinates
      if (result.places && Array.isArray(result.places)) {
        result.places = result.places.map((place: any) => {
          const coords = getPlaceCoordinates(destination, place.name || "");
          return {
            name: place.name || "Unknown Place",
            description: place.description || "A beautiful place to visit",
            type: place.type || "landmark",
            coordinates: coords || undefined,
          };
        });
      }
      
      // Ensure overview exists
      if (!result.overview) {
        result.overview = {
          budget: {
            accommodation: `$${Math.round(calculatedBudgetPerNight * numDays)}-$${Math.round(calculatedBudgetPerNight * 1.2 * numDays)}`,
            food: "$50-100 per day",
            transport: "$100-200",
            activities: "$200-400",
            total: `$${Math.round((calculatedBudgetPerNight * numDays + 350) * travelers)}-$${Math.round((calculatedBudgetPerNight * 1.2 * numDays + 700) * travelers)}`
          },
          transportPass: "Check local transport pass options",
          practicalInfo: ["Currency: Check local currency", "Tipping: Check local customs", "SIM/Wi-Fi: Available at airport"]
        };
      }

      // Ensure tips array exists
      if (!result.tips || !Array.isArray(result.tips)) {
        result.tips = [
          "Book popular attractions in advance",
          "Check current events and seasonal considerations",
          "Carry local currency for small purchases",
          "Download offline maps and translation apps"
        ];
      }
      
      return result;
    }
    
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("AI generation error:", error);
    // Format error to friendly message
    throw formatOpenAIError(error);
  }
}

/**
 * Format OpenAI errors into user-friendly messages
 * Prevents [object Object] from being displayed to users
 */
function formatOpenAIError(error: any): Error {
  // Log full error for debugging
  console.error("Full error details:", error);
  
  let message = "Unknown error—check console for details.";
  
  // Extract error message from various error formats
  const errorMessage = error?.message || error?.error?.message || String(error);
  const errorCode = error?.code || error?.status || error?.statusCode;
  
  // Check for specific error types
  if (
    errorMessage?.includes("invalid_request_error") ||
    errorMessage?.includes("authentication_error") ||
    errorMessage?.includes("API key") ||
    errorCode === 401 ||
    errorMessage?.includes("Unauthorized")
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
  } else if (
    errorMessage?.includes("token") ||
    errorMessage?.includes("maximum context length") ||
    errorMessage?.includes("context_length_exceeded")
  ) {
    message = "Prompt too complex—try shorter trip or simpler destination.";
  } else if (errorMessage?.includes("No response from AI")) {
    message = "AI returned empty response—try again with different inputs.";
  } else if (errorMessage?.includes("AI response invalid")) {
    message = "AI response invalid—try simpler inputs.";
  } else if (typeof errorMessage === "string" && errorMessage.length > 0) {
    // Use the error message if it's a string
    message = errorMessage;
  }
  
  return new Error(message);
}
