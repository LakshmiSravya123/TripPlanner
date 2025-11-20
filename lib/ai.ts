import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getWeatherForecast } from "./weather";
import { getCoordinates, buildGoogleFlightsLink, buildBookingLink } from "./utils";
import { getPlaceCoordinates } from "./places";

export interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budgetPerNight: number;
  interests: string[];
  openaiKey?: string;
}

export async function generateTripPlan(formData: TripFormData) {
  const { destination, startDate, endDate, travelers, budgetPerNight, interests } = formData;
  
  // Get coordinates and weather
  const coords = getCoordinates(destination);
  let weatherData: any[] = [];
  
  if (coords) {
    const numDays = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    weatherData = await getWeatherForecast(coords[0], coords[1], startDate, numDays);
  }

  // Build booking links
  const googleFlightsLink = buildGoogleFlightsLink(destination, startDate, endDate);
  const bookingBudgetLink = buildBookingLink(destination, startDate, endDate, travelers, Math.round(budgetPerNight * 0.7));
  const bookingMidLink = buildBookingLink(destination, startDate, endDate, travelers, Math.round(budgetPerNight * 1.2));
  const bookingLuxuryLink = buildBookingLink(destination, startDate, endDate, travelers);

  const numDays = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const weatherSummary = weatherData.length > 0
    ? weatherData.map((w, i) => `Day ${i + 1} (${w.date}): ${w.min}–${w.max}°C, ${w.condition}`).join("\n")
    : "Weather data unavailable. Using general seasonal guidance.";

  const prompt = `You are an expert travel planner. Create a complete trip plan for ${destination} from ${startDate} to ${endDate} for ${travelers} traveler(s).

Budget: $${budgetPerNight}/night for accommodation
Interests: ${interests.join(", ") || "General travel"}

Weather Forecast:
${weatherSummary}

CRITICAL: Return ONLY valid JSON with no comments, no markdown, no extra text. The JSON must be parseable.

Return this exact JSON structure:
{
  "destination": "${destination}",
  "description": "A captivating 2-3 sentence description of ${destination} highlighting its unique charm, culture, and appeal",
  "inspiration": "3-4 inspiring reasons to visit ${destination}, each in one sentence, focusing on unique experiences",
  "places": [
    {"name": "Famous Landmark Name", "description": "Brief 1-2 sentence description with historical/cultural context and why it's worth visiting", "type": "landmark"},
    {"name": "Cultural Site Name", "description": "Brief 1-2 sentence description highlighting cultural significance", "type": "culture"},
    {"name": "Natural Attraction Name", "description": "Brief 1-2 sentence description of natural beauty and experiences", "type": "nature"}
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
    "budget": [{"name": "Budget Hotel", "location": "City Center", "priceRange": "$${Math.round(budgetPerNight * 0.7)}-$${Math.round(budgetPerNight * 0.9)}", "rating": 4.2, "link": "${bookingBudgetLink}"}],
    "midRange": [{"name": "Mid-Range Hotel", "location": "City Center", "priceRange": "$${Math.round(budgetPerNight * 1.1)}-$${Math.round(budgetPerNight * 1.3)}", "rating": 4.6, "link": "${bookingMidLink}"}],
    "luxury": [{"name": "Luxury Hotel", "location": "Prime Location", "priceRange": "$${Math.round(budgetPerNight * 1.5)}-$${Math.round(budgetPerNight * 2)}", "rating": 4.8, "link": "${bookingLuxuryLink}"}]
  },
  "itineraries": {
    "economic": ${JSON.stringify(Array.from({ length: numDays }, (_, i) => ({
      day: i + 1,
      date: new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      activities: ["Morning: Activity - 9AM - $20", "Afternoon: Activity - 2PM - $30", "Evening: Activity - 7PM - $25"]
    })))},
    "balanced": ${JSON.stringify(Array.from({ length: numDays }, (_, i) => ({
      day: i + 1,
      date: new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      activities: ["Morning: Activity - 9AM - $40", "Afternoon: Activity - 2PM - $50", "Evening: Activity - 7PM - $60"]
    })))},
    "luxury": ${JSON.stringify(Array.from({ length: numDays }, (_, i) => ({
      day: i + 1,
      date: new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      activities: ["Morning: Activity - 9AM - $80", "Afternoon: Activity - 2PM - $100", "Evening: Activity - 7PM - $120"]
    })))}
  },
  "costs": {
    "economic": {"perPerson": "$800-1200", "total": "$${800 * travelers}-$${1200 * travelers}"},
    "balanced": {"perPerson": "$1200-1800", "total": "$${1200 * travelers}-$${1800 * travelers}"},
    "luxury": {"perPerson": "$2000-3000", "total": "$${2000 * travelers}-$${3000 * travelers}"}
  }
}

IMPORTANT RULES:
1. Return ONLY the JSON object, nothing else
2. No trailing commas in arrays or objects
3. All strings must be properly escaped
4. Fill all ${numDays} days for each itinerary
5. Keep activities concise (one line each)
6. Weather-aware: suggest indoor alternatives if rain is forecasted
7. Use realistic prices and airline names
8. Make hotel names and locations specific to ${destination}

Return the JSON now:`;

  // Use provided key or fallback to environment variable
  const apiKey = formData.openaiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Please provide an API key in the form or set it in environment variables.");
  }

  try {
    // Temporarily set the API key in environment if provided
    const originalKey = process.env.OPENAI_API_KEY;
    if (formData.openaiKey) {
      process.env.OPENAI_API_KEY = formData.openaiKey;
    }
    
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
      maxTokens: 3000, // Increased for more complete responses
    });
    
    // Restore original key
    if (formData.openaiKey && originalKey) {
      process.env.OPENAI_API_KEY = originalKey;
    }

    // Clean and parse JSON response
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    
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
      console.error("No JSON found. Response text:", text.substring(0, 500));
      throw new Error("No valid JSON found in AI response. Please try again.");
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
    
    // Fix unescaped newlines in strings
    jsonString = jsonString.replace(/("(?:[^"\\]|\\.)*")\s*\n\s*/g, "$1 ");
    
    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (parseError: any) {
      const errorPos = parseInt(parseError.message.match(/position (\d+)/)?.[1] || "0");
      console.error("JSON Parse Error:", parseError.message);
      console.error("Error position:", errorPos);
      console.error("JSON around error:", jsonString.substring(Math.max(0, errorPos - 200), errorPos + 200));
      console.error("Full JSON length:", jsonString.length);
      
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
        // Last resort: create a fallback structure with the data we have
        console.error("All JSON parsing attempts failed. Creating fallback structure.");
        result = {
          destination,
          description: `A beautiful trip to ${destination}`,
          inspiration: [
            `Discover the rich culture and history of ${destination}`,
            `Experience world-class cuisine and local flavors`,
            `Explore stunning architecture and iconic landmarks`,
          ],
          places: [],
          dates: { start: startDate, end: endDate },
          travelers,
          weather: weatherData,
          flights: {
            economy: { airline: "Major Airline", priceRange: "$600-900", duration: "8h 30m", link: googleFlightsLink },
            comfort: { airline: "Major Airline", priceRange: "$900-1200", duration: "8h 30m", link: googleFlightsLink },
            premium: { airline: "Major Airline", priceRange: "$1200-1800", duration: "8h 30m", link: googleFlightsLink },
          },
          hotels: {
            budget: [{ name: "Budget Hotel", location: "City Center", priceRange: `$${Math.round(budgetPerNight * 0.7)}-$${Math.round(budgetPerNight * 0.9)}`, rating: 4.2, link: bookingBudgetLink }],
            midRange: [{ name: "Mid-Range Hotel", location: "City Center", priceRange: `$${Math.round(budgetPerNight * 1.1)}-$${Math.round(budgetPerNight * 1.3)}`, rating: 4.6, link: bookingMidLink }],
            luxury: [{ name: "Luxury Hotel", location: "Prime Location", priceRange: `$${Math.round(budgetPerNight * 1.5)}-$${Math.round(budgetPerNight * 2)}`, rating: 4.8, link: bookingLuxuryLink }],
          },
          itineraries: {
            economic: Array.from({ length: numDays }, (_, i) => ({
              day: i + 1,
              date: new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              activities: ["Morning: Explore local attractions - 9AM - $20", "Afternoon: Visit museums - 2PM - $30", "Evening: Enjoy local cuisine - 7PM - $25"],
            })),
            balanced: Array.from({ length: numDays }, (_, i) => ({
              day: i + 1,
              date: new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              activities: ["Morning: Guided tour - 9AM - $40", "Afternoon: Cultural experience - 2PM - $50", "Evening: Fine dining - 7PM - $60"],
            })),
            luxury: Array.from({ length: numDays }, (_, i) => ({
              day: i + 1,
              date: new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              activities: ["Morning: Private tour - 9AM - $80", "Afternoon: Exclusive experience - 2PM - $100", "Evening: Premium dining - 7PM - $120"],
            })),
          },
          costs: {
            economic: { perPerson: "$800-1200", total: `$${800 * travelers}-$${1200 * travelers}` },
            balanced: { perPerson: "$1200-1800", total: `$${1200 * travelers}-$${1800 * travelers}` },
            luxury: { perPerson: "$2000-3000", total: `$${2000 * travelers}-$${3000 * travelers}` },
          },
        };
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
      
      // Ensure inspiration is an array
      if (result.inspiration && typeof result.inspiration === "string") {
        result.inspiration = result.inspiration.split("\n").filter((line: string) => line.trim());
      } else if (!result.inspiration) {
        result.inspiration = [
          `Discover the rich culture and history of ${destination}`,
          `Experience world-class cuisine and local flavors`,
          `Explore stunning architecture and iconic landmarks`,
        ];
      }
      
      return result;
    }
    
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("AI generation error:", error);
    throw error;
  }
}
