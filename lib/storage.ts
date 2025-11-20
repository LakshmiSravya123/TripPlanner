// Local storage utilities for saving trips
export interface SavedTrip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  data: any;
  savedAt: string;
  image?: string;
}

const STORAGE_KEY = "ai_trip_planner_saved_trips";

export function saveTrip(tripData: any): SavedTrip {
  const trip: SavedTrip = {
    id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    destination: tripData.destination,
    startDate: tripData.dates?.start || "",
    endDate: tripData.dates?.end || "",
    travelers: tripData.travelers || 2,
    data: tripData,
    savedAt: new Date().toISOString(),
    image: tripData.image || `https://source.unsplash.com/800x600/?${encodeURIComponent(tripData.destination)}`,
  };

  const trips = getSavedTrips();
  trips.unshift(trip); // Add to beginning
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  return trip;
}

export function getSavedTrips(): SavedTrip[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function deleteTrip(id: string): void {
  const trips = getSavedTrips();
  const filtered = trips.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getTrip(id: string): SavedTrip | null {
  const trips = getSavedTrips();
  return trips.find((t) => t.id === id) || null;
}

