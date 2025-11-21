import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
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

  // Search for current prices and events (with timeout to prevent hanging)
  // Make these non-blocking - run in parallel and don't wait too long
  let jrPassInfo = '';
  let currentEvents = '';
  let currentPrices = '';
  
  // Run all searches in parallel with short timeouts
  const searchPromises = [];
  
  if (destination.toLowerCase().includes('japan')) {
    searchPromises.push(
      Promise.race([
        searchCurrentPrice('JR Pass', 'Japan'),
        new Promise<string>((resolve) => setTimeout(() => resolve(''), 3000)) // 3s timeout
      ]).then(result => { jrPassInfo = result; }).catch(() => {})
    );
  }
  
  searchPromises.push(
    Promise.race([
      searchTravelInfo(destination, 'current events 2025'),
      new Promise<string>((resolve) => setTimeout(() => resolve(''), 3000))
    ]).then(result => { currentEvents = result; }).catch(() => {})
  );
  
  searchPromises.push(
    Promise.race([
      searchTravelInfo(destination, 'current prices 2025'),
      new Promise<string>((resolve) => setTimeout(() => resolve(''), 3000))
    ]).then(result => { currentPrices = result; }).catch(() => {})
  );
  
  // Wait max 3 seconds for all searches
  await Promise.race([
    Promise.all(searchPromises),
    new Promise(resolve => setTimeout(resolve, 3000))
  ]);

  const groupDescription = group || `${travelers} ${travelers === 1 ? 'adult' : 'adults'}`;
  const budgetDescription = budget || (calculatedBudgetPerNight ? `$${calculatedBudgetPerNight}/night` : 'mid-range');

  const systemPrompt = `Generate ONLY: Overview (route, budget breakdown, transport pass, embedded Google Flights iframe for sample round-trip & Booking.com iframes for hotels by city/dates). Then Day-by-Day (date header, timed bullets: activity/time/cost ¥/transport note, unique researched details like weather/events/veggie food—no repeats). End with Tips (apps, sustainability). Exclude Why Visit/Map/intros. Update via web_search for current prices/events (e.g., JR Pass ¥50k). Make engaging/realistic.`;

  const exampleItinerary = `EXAMPLE FORMAT (follow this EXACTLY):

Overview:
Route: Tokyo (Days 1–3) → Hakone/Mt. Fuji (Day 4) → Kyoto (Days 5–6) → Nara/Osaka (Day 7).
Transport: 7-day JR Pass (~¥50,000/person; activate Day 4). Suica card for local (~¥3,000 load).
Budget Breakdown: Transport ¥60,000; Food ¥40,000; Entries ¥15,000; Misc ¥20,000 (per person).

Day 1: Fri, Nov 21 – Tokyo Arrival & Urban Buzz
9AM–12PM: Settle in Shinjuku; stroll Kabukicho (free, Godzilla statue photo-op).
1–5PM: Meiji Shrine & Harajuku (free; autumn ginkgo leaves). Lunch: Vegetarian tonkatsu at Ain Soph (¥1,500).
6–9PM: Shibuya Crossing + Sky Deck (¥2,400; sunset views). Dinner: Veggie ramen at Ichiran (¥1,200).
Transport: Airport train (~¥1,200). Daily Total: ¥6,300.`;

  const prompt = `You are an expert travel planner. ${systemPrompt}

Create a HYPER-DETAILED travel itinerary for ${destination} starting ${startDate} for ${groupDescription}.

${exampleItinerary}

Budget: ${budgetDescription}
Interests: ${interests.join(", ") || "General travel"}

Weather Forecast:
${weatherSummary}

${jrPassInfo ? `Current Transport Info: ${jrPassInfo}\n` : ''}
${currentEvents ? `Current Events: ${currentEvents}\n` : ''}
${currentPrices ? `Current Prices: ${currentPrices}\n` : ''}

CRITICAL: You MUST generate REAL, SPECIFIC content. NO generic placeholders like "Guided tour - 9AM - $40". 
Instead use: "9AM–12PM: Senso-ji Temple, Asakusa (free; early for Shichi-Go-San kimono sightings). Lunch: Shojin vegan bento at Torikyu (¥1,800)."

CRITICAL STRUCTURE - Follow this EXACT format:

1. OVERVIEW SECTION:
   - Total budget breakdown (accommodation, food, transport, activities)
   - Transport pass recommendations (e.g., "7-day JR Pass - activate on Day X", "City pass", etc.)
   - Key practical info (currency, tipping, SIM/Wi-Fi, etc.)

2. DAY-BY-DAY ITINERARY:
   Format each day as:
   Day X – [Theme/Title] (Date: YYYY-MM-DD)
   
   [Time, e.g., 7:00] [Activity Title]
   - Location: [Specific address/area]
   - Description: [Detailed 2-3 sentence description]
   - Transport: [How to get there, e.g., "Shinkansen Tokyo → Odawara (35 min, ¥3,000)"]
   - Cost: [Specific price, e.g., "¥2,400" or "$50"]
   - Link: [Booking link if applicable]
   - Tips: [Practical advice, e.g., "Book weeks ahead!", "Go early to avoid crowds"]
   
   [Time, e.g., 12:00] [Lunch/Activity]
   - [Same structure]
   
   Daily Total: [Transport + Activities + Food = $X]

3. TIPS SECTION:
   - Booking recommendations
   - Best times to visit attractions
   - Money-saving tips
   - Cultural notes
   - Current events/seasonal considerations

REQUIREMENTS:
- Include Day 0 (Arrival) with airport transfer, hotel check-in, transport pass pickup
- Include departure day with airport transfer details
- Every activity MUST have: time, location, transport method, cost
- Use REALISTIC prices in local currency
- Include specific restaurant names and booking links where possible
- Transportation details must be specific (train lines, duration, cost)
- NO generic placeholders - use actual place names, restaurant names, costs
- Weather-aware: suggest indoor alternatives if rain forecasted
- Keep pacing realistic - don't overpack days
- Include vegetarian options if relevant

CRITICAL: Return ONLY valid JSON with no comments, no markdown, no extra text. The JSON must be parseable.
DO NOT include any explanatory text before or after the JSON.
DO NOT wrap the JSON in markdown code blocks.
START your response with { and END with }.

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

  try {
    // Chain-of-thought reasoning for better error handling
    const reasoningPrompt = `${prompt}

If the response seems generic or lacks specifics, use chain-of-thought reasoning:
1. Analyze what specific details are missing
2. Research current information about ${destination}
3. Break down each activity into specific components (time, location, cost, transport)
4. Verify prices and availability
5. Generate detailed, unique content with no repeats

Return the JSON now:`;

    // Set API key in environment for this request
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = apiKey;

    try {
      let { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system: "You are a JSON-only travel itinerary generator. You MUST return ONLY valid JSON. No markdown, no explanations, no text before or after the JSON. Start with { and end with }.",
        prompt: reasoningPrompt,
        temperature: 0.3, // Lower temperature for more consistent JSON output
        maxTokens: 8000, // Increased for more detailed content
      });
    
    // If response is too generic, retry with chain-of-thought
    if (text.includes("generic") || text.length < 1000 || !text.includes("activities") || text.includes("Guided tour") || text.includes("Cultural experience")) {
      console.log("Response seems generic, retrying with chain-of-thought...");
      const chainOfThoughtPrompt = `${prompt}

CHAIN-OF-THOUGHT REASONING REQUIRED - BE SPECIFIC:
1. List 10+ specific attractions in ${destination} with exact names and current entry costs
2. List 5+ specific vegetarian restaurants in ${destination} with names and typical meal costs
3. What are current prices for transport passes? (e.g., JR Pass ¥50,000 for Japan, activate Day X)
4. What is the exact route progression? (e.g., "Tokyo (Days 1–3) → Hakone (Day 4) → Kyoto (Days 5–6)")
5. For each day, provide 3-5 activities with EXACT times (e.g., "9AM–12PM"), locations, costs in local currency
6. Include specific transportation details: "Shinkansen Tokyo → Odawara (35 min, ¥3,000)" not "train"
7. Calculate daily totals: Transport + Activities + Food = total in local currency

CRITICAL: Generate REAL content. If you see "Guided tour - 9AM - $40", that's WRONG. 
Instead use: "9AM–12PM: Senso-ji Temple, Asakusa (free; early for Shichi-Go-San kimono sightings). Lunch: Shojin vegan bento at Torikyu (¥1,800)."

Now generate the detailed itinerary with these specific details:`;

      const retryResult = await generateText({
        model: openai("gpt-4o-mini"),
        system: "You are a JSON-only travel itinerary generator. You MUST return ONLY valid JSON. No markdown, no explanations, no text before or after the JSON. Start with { and end with }.",
        prompt: chainOfThoughtPrompt,
        temperature: 0.3, // Lower temperature for more consistent JSON output
        maxTokens: 8000, // Increased for more detailed content
      });
      text = retryResult.text;
    } finally {
      // Restore original key
      if (originalKey !== undefined) {
        process.env.OPENAI_API_KEY = originalKey;
      } else {
        delete process.env.OPENAI_API_KEY;
      }
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
    throw error;
  }
}
