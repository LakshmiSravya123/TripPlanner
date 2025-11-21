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

  // API key setup with better diagnostics
  const userProvidedKey = formData.openaiKey?.trim();
  const envKey = process.env.OPENAI_API_KEY?.trim();
  const apiKey = userProvidedKey || envKey;
  
  console.log('API Key Debug:', {
    userKeyProvided: !!userProvidedKey,
    userKeyLength: userProvidedKey?.length || 0,
    envKeyAvailable: !!envKey,
    envKeyLength: envKey?.length || 0,
    finalKeyLength: apiKey?.length || 0
  });
  
  if (!apiKey) {
    if (!userProvidedKey && !envKey) {
      throw new Error("No OpenAI API key found. Please either:\n1. Enter your API key in the form, or\n2. Set OPENAI_API_KEY environment variable in Vercel dashboard");
    } else {
      throw new Error("API key is empty. Please check your key and try again.");
    }
  }

  if (!apiKey.startsWith('sk-')) {
    throw new Error(`Invalid OpenAI API key format. Expected format: sk-... but got: ${apiKey.substring(0, 8)}... (Key should start with 'sk-')`);
  }

  if (apiKey.length < 20) {
    throw new Error(`API key appears too short (${apiKey.length} characters). OpenAI keys are typically 51+ characters long.`);
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
      system: "You are a JSON generator. Return ONLY valid JSON. No text before or after. No markdown. No explanations. Start with { and end with }. Ensure all strings are properly quoted and escaped.",
      prompt: `Generate a ${numDays}-day travel itinerary for ${destination} (${startDate} to ${endDate}) for ${groupDescription}. Budget: ${budgetDescription}. Weather: ${weatherSummary}.

CRITICAL: Return ONLY valid JSON. No markdown blocks. No explanations.

Required JSON structure:
{
  "destination": "${destination}",
  "description": "Brief trip overview",
  "overview": {
    "budget": {"total": "$${Math.round((calculatedBudgetPerNight * numDays + 300) * travelers)}"},
    "transportPass": "Transport recommendation",
    "practicalInfo": ["Currency info", "Local tips"]
  },
  "places": [{"name": "Main Attraction", "type": "landmark", "coordinates": [0, 0]}],
  "dates": {"start": "${startDate}", "end": "${endDate}"},
  "travelers": ${travelers},
  "weather": ${JSON.stringify(weatherData)},
  "flights": {
    "economy": {"airline": "Major Airlines", "priceRange": "$600-900", "duration": "8h", "link": "${googleFlightsLink}"}
  },
  "hotels": {
    "midRange": [{"name": "Recommended Hotel", "location": "City Center", "priceRange": "$${calculatedBudgetPerNight}", "rating": 4.5, "link": "${bookingMidLink}"}]
  },
  "itineraries": {
    "balanced": []
  },
  "tips": ["Practical travel tip"],
  "costs": {"balanced": {"total": "$${1200 * travelers}"}}
}

Fill balanced array with ${numDays + 1} days (day 0 = arrival). Each day needs: day, date, title, activities array, dailyTotal. Each activity needs: time, title, location, description, cost.`,
      temperature: 0.5, // Lower for more consistent JSON
      maxTokens: 1800, // Smaller to reduce truncation issues
    });

    let text = result.text?.trim();
    
    if (!text) {
      throw new Error("Empty response from AI service");
    }
    
    // Ultra-robust JSON extraction with extensive debugging
    console.log("=== AI Response Debug ===");
    console.log("Raw response length:", text.length);
    console.log("Raw response (first 500 chars):", text.substring(0, 500));
    console.log("Raw response (last 200 chars):", text.substring(Math.max(0, text.length - 200)));
    
    let jsonString = text.trim();
    
    // Step 1: Remove markdown code blocks
    const beforeMarkdown = jsonString;
    jsonString = jsonString.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    if (beforeMarkdown !== jsonString) {
      console.log("Removed markdown blocks");
    }
    
    // Step 2: Find JSON boundaries
    const start = jsonString.indexOf("{");
    const end = jsonString.lastIndexOf("}");
    
    console.log("JSON boundaries:", { start, end, length: jsonString.length });
    
    if (start === -1 || end === -1 || start >= end) {
      console.error("❌ Invalid JSON boundaries");
      console.error("Full response:", text);
      throw new Error("No valid JSON found in AI response. The AI returned text instead of JSON.");
    }
    
    // Step 3: Extract JSON
    jsonString = jsonString.substring(start, end + 1);
    console.log("Extracted JSON length:", jsonString.length);
    console.log("Extracted JSON (first 300 chars):", jsonString.substring(0, 300));
    
    // Step 4: Progressive JSON cleanup
    const originalJson = jsonString;
    
    // Fix trailing commas (multiple passes)
    let prevLength;
    do {
      prevLength = jsonString.length;
      jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1");
    } while (jsonString.length !== prevLength);
    
    // Fix common JSON issues
    jsonString = jsonString.replace(/([^\\])\\n/g, '$1\\\\n'); // Fix unescaped newlines
    jsonString = jsonString.replace(/([^\\])\\t/g, '$1\\\\t'); // Fix unescaped tabs
    jsonString = jsonString.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ''); // Remove control chars
    
    if (originalJson !== jsonString) {
      console.log("Applied JSON cleanup");
    }
    
    // Step 5: Attempt parsing with detailed error reporting
    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonString);
      console.log("✅ JSON parsed successfully");
    } catch (parseError: any) {
      console.error("❌ JSON Parse Failed");
      console.error("Parse error:", parseError.message);
      
      // Try to identify the error location
      const errorMatch = parseError.message.match(/position (\d+)/);
      if (errorMatch) {
        const pos = parseInt(errorMatch[1]);
        console.error("Error at position:", pos);
        console.error("Context around error:", jsonString.substring(Math.max(0, pos - 50), pos + 50));
      }
      
      console.error("Cleaned JSON (first 1000 chars):", jsonString.substring(0, 1000));
      
      // Try aggressive fixes
      let fixedJson = jsonString;
      
      // Fix unbalanced brackets
      const openBraces = (fixedJson.match(/\{/g) || []).length;
      const closeBraces = (fixedJson.match(/\}/g) || []).length;
      const openBrackets = (fixedJson.match(/\[/g) || []).length;
      const closeBrackets = (fixedJson.match(/\]/g) || []).length;
      
      console.log("Bracket counts:", { openBraces, closeBraces, openBrackets, closeBrackets });
      
      if (openBraces > closeBraces) {
        fixedJson += "}".repeat(openBraces - closeBraces);
        console.log("Added missing closing braces");
      }
      if (openBrackets > closeBrackets) {
        fixedJson += "]".repeat(openBrackets - closeBrackets);
        console.log("Added missing closing brackets");
      }
      
      try {
        parsedResult = JSON.parse(fixedJson);
        console.log("✅ JSON parsed after bracket fixes");
      } catch (retryError: any) {
        console.error("❌ All JSON parsing attempts failed");
        console.error("Final error:", retryError.message);
        console.error("Falling back to minimal trip plan due to JSON parse error.");
        // Fallback: use an empty object so we can still build a safeResult with defaults
        parsedResult = {};
      }
    }
    
    // Validate and ensure required structure
    if (!parsedResult || typeof parsedResult !== 'object') {
      throw new Error("Invalid response structure from AI service");
    }
    
    // Build robust costs structure with sensible defaults
    const baseTotal = 1200 * travelers;
    const safeCosts = parsedResult.costs || {};
    const economic = safeCosts.economic || {
      perPerson: `$${Math.round(baseTotal * 0.7 / Math.max(travelers, 1))}`,
      total: `$${Math.round(baseTotal * 0.7)}`,
    };
    const balanced = safeCosts.balanced || {
      perPerson: `$${Math.round(baseTotal / Math.max(travelers, 1))}`,
      total: `$${baseTotal}`,
    };
    const luxury = safeCosts.luxury || {
      perPerson: `$${Math.round(baseTotal * 1.5 / Math.max(travelers, 1))}`,
      total: `$${Math.round(baseTotal * 1.5)}`,
    };

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
      costs: {
        economic,
        balanced,
        luxury,
      },
    };
    
    return safeResult;
    
  } catch (error: any) {
    console.error("AI generation error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      stack: error.stack?.substring(0, 500)
    });
    
    // Provide more specific error messages based on error type
    if (error.message?.includes("API key") || error.status === 401) {
      throw new Error("Invalid API key. Please check that your OpenAI API key is correct and has sufficient credits.");
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit") || error.status === 429) {
      throw new Error("API rate limit exceeded. Please wait a moment and try again, or check your OpenAI account usage.");
    } else if (error.message?.includes("insufficient_quota") || error.status === 402) {
      throw new Error("Insufficient API credits. Please add credits to your OpenAI account and try again.");
    } else if (error.message?.includes("timeout") || error.message?.includes("network") || error.name === "AbortError") {
      throw new Error("Request timed out. Please try again with a simpler destination or date range.");
    } else if (error.status === 400) {
      throw new Error("Invalid request. Please check your inputs and try again.");
    } else if (error.status === 500 || error.status === 502 || error.status === 503) {
      throw new Error("OpenAI service is temporarily unavailable. Please try again in a few moments.");
    } else {
      // Include more details for debugging
      const errorMsg = error.message || "Unknown error occurred";
      throw new Error(`Unable to generate trip plan: ${errorMsg}`);
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
