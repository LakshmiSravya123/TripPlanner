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

export function getCoordinates(destination: string): [number, number] | null {
  const destinations: Record<string, [number, number]> = {
    croatia: [45.1, 15.2],
    zagreb: [45.815, 15.978],
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
  };
  
  // Normalize the destination string
  let key = destination.toLowerCase().trim();
  
  // Remove common suffixes and extra words
  key = key.replace(/\s+(city|town|capital)$/i, "");
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

