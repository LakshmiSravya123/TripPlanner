import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildGoogleFlightsLink(
  destination: string,
  startDate: string,
  endDate: string,
  origin: string = "NYC"
): string {
  const destEncoded = encodeURIComponent(destination);
  return `https://www.google.com/travel/flights?q=Flights%20to%20${destEncoded}%20from%20${origin}%20on%20${startDate}%20through%20${endDate}`;
}

export function buildBookingLink(
  destination: string,
  checkin: string,
  checkout: string,
  adults: number,
  maxPrice?: number
): string {
  const destEncoded = encodeURIComponent(destination);
  let url = `https://www.booking.com/searchresults.html?ss=${destEncoded}&checkin=${checkin}&checkout=${checkout}&group_adults=${adults}`;
  if (maxPrice) {
    url += `&price=USD-${maxPrice}`;
  }
  return url;
}

// Cache for geocoded coordinates to avoid repeated API calls
const geocodeCache = new Map<string, [number, number]>();

export async function geocodeDestination(destination: string): Promise<[number, number] | null> {
  // Check cache first
  const cacheKey = destination.toLowerCase().trim();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    // Use OpenStreetMap Nominatim API (free, no key required)
    const encoded = encodeURIComponent(destination);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AI-Trip-Planner/1.0' // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      const coords: [number, number] = [lat, lon];
      geocodeCache.set(cacheKey, coords);
      return coords;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  
  return null;
}

export function getCoordinates(destination: string): [number, number] | null {
  const destinations: Record<string, [number, number]> = {
    croatia: [45.1, 15.2],
    split: [43.508, 16.44],
    dubrovnik: [42.65, 18.094],
    paris: [48.8566, 2.3522],
    london: [51.5074, -0.1278],
    rome: [41.9028, 12.4964],
    barcelona: [41.3851, 2.1734],
    madrid: [40.4168, -3.7038],
    amsterdam: [52.3676, 4.9041],
    berlin: [52.52, 13.405],
    vienna: [48.2082, 16.3738],
    prague: [50.0755, 14.4378],
    budapest: [47.4979, 19.0402],
    athens: [37.9838, 23.7275],
    lisbon: [38.7223, -9.1393],
    dublin: [53.3498, -6.2603],
    edinburgh: [55.9533, -3.1883],
    tokyo: [35.6762, 139.6503],
    seoul: [37.5665, 126.9780],
    singapore: [1.3521, 103.8198],
    sydney: [-33.8688, 151.2093],
    melbourne: [-37.8136, 144.9631],
    newyork: [40.7128, -74.0060],
    "new york": [40.7128, -74.0060],
    "new york city": [40.7128, -74.0060],
    nyc: [40.7128, -74.0060],
    losangeles: [34.0522, -118.2437],
    "los angeles": [34.0522, -118.2437],
    la: [34.0522, -118.2437],
    sanfrancisco: [37.7749, -122.4194],
    "san francisco": [37.7749, -122.4194],
    sf: [37.7749, -122.4194],
    miami: [25.7617, -80.1918],
    chicago: [41.8781, -87.6298],
    dubai: [25.2048, 55.2708],
    istanbul: [41.0082, 28.9784],
    cairo: [30.0444, 31.2357],
    marrakech: [31.6295, -7.9811],
    "cape town": [-33.9249, 18.4241],
    capetown: [-33.9249, 18.4241],
    rio: [-22.9068, -43.1729],
    "rio de janeiro": [-22.9068, -43.1729],
    buenosaires: [-34.6037, -58.3816],
    "buenos aires": [-34.6037, -58.3816],
    bali: [-8.3405, 115.0920],
    "bali indonesia": [-8.3405, 115.0920],
    thailand: [15.8700, 100.9925],
    bangkok: [13.7563, 100.5018],
    phuket: [7.8804, 98.3923],
    mumbai: [19.0760, 72.8777],
    delhi: [28.6139, 77.2090],
    bangalore: [12.9716, 77.5946],
    kolkata: [22.5726, 88.3639],
    chennai: [13.0827, 80.2707],
    hyderabad: [17.3850, 78.4867],
    pune: [18.5204, 73.8567],
    jaipur: [26.9124, 75.7873],
    goa: [15.2993, 74.1240],
    kerala: [10.8505, 76.2711],
    manila: [14.5995, 120.9842],
    hongkong: [22.3193, 114.1694],
    "hong kong": [22.3193, 114.1694],
    beijing: [39.9042, 116.4074],
    shanghai: [31.2304, 121.4737],
    moscow: [55.7558, 37.6173],
    stpetersburg: [59.9343, 30.3351],
    "st petersburg": [59.9343, 30.3351],
    stockholm: [59.3293, 18.0686],
    copenhagen: [55.6761, 12.5683],
    oslo: [59.9139, 10.7522],
    helsinki: [60.1699, 24.9384],
    reykjavik: [64.1466, -21.9426],
    zurich: [47.3769, 8.5417],
    geneva: [46.2044, 6.1432],
    brussels: [50.8503, 4.3517],
    warsaw: [52.2297, 21.0122],
    krakow: [50.0647, 19.9450],
    bucharest: [44.4268, 26.1025],
    sofia: [42.6977, 23.3219],
    belgrade: [44.7866, 20.4489],
    zagreb: [45.8150, 15.9819],
    sarajevo: [43.8519, 18.3867],
    skopje: [41.9973, 21.4280],
    tirana: [41.3275, 19.8187],
    podgorica: [42.4304, 19.2594],
    banjaluka: [44.7722, 17.1910],
    mostar: [43.3438, 17.8078],
    zadar: [44.1194, 15.2314],
    pula: [44.8666, 13.8496],
    rijeka: [45.3271, 14.4422],
    osijek: [45.5550, 18.6955],
    varazdin: [46.3047, 16.3366],
    sibenik: [43.7350, 15.8950],
    trogir: [43.5169, 16.2517],
    hvar: [43.1725, 16.4431],
    korcula: [42.9564, 17.1367],
    makarska: [43.2969, 17.0178],
    plitvice: [44.8656, 15.5820],
    "plitvice lakes": [44.8656, 15.5820],
    krka: [43.8020, 15.9720],
    "krka national park": [43.8020, 15.9720],
  };
  
  // Normalize the destination string
  let key = destination.toLowerCase().trim();
  
  // Remove common suffixes and extra words
  key = key.replace(/\s+(city|town|capital|country|island)$/i, "");
  key = key.replace(/\s+/g, " "); // Normalize spaces
  
  // Try exact match first
  if (destinations[key]) {
    return destinations[key];
  }
  
  // Try without spaces
  const noSpaces = key.replace(/\s+/g, "");
  if (destinations[noSpaces]) {
    return destinations[noSpaces];
  }
  
  // Try partial match (check if destination contains any key)
  for (const [destKey, coords] of Object.entries(destinations)) {
    if (key.includes(destKey) || destKey.includes(key)) {
      return coords;
    }
  }
  
  return null;
}

