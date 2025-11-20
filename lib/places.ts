import { getCoordinates } from "./utils";

// Get approximate coordinates for famous places in a destination
export function getPlaceCoordinates(destination: string, placeName: string): [number, number] | null {
  const destCoords = getCoordinates(destination);
  if (!destCoords) return null;

  // Common place offsets (in degrees) - approximate locations
  const placeOffsets: Record<string, [number, number]> = {
    // Paris
    "eiffel tower": [0.01, 0.01],
    "louvre": [0.005, 0.005],
    "notre dame": [-0.005, 0.005],
    "arc de triomphe": [0.008, 0.008],
    "champs elysees": [0.008, 0.008],
    
    // London
    "big ben": [-0.01, 0.01],
    "london eye": [-0.01, 0.01],
    "tower bridge": [0.01, -0.01],
    "buckingham palace": [-0.008, 0.008],
    "british museum": [-0.005, 0.01],
    
    // Rome
    "colosseum": [0.01, -0.01],
    "vatican": [-0.01, 0.01],
    "trevi fountain": [0.005, 0.005],
    "pantheon": [0.003, 0.003],
    
    // Tokyo
    "tokyo tower": [0.01, -0.01],
    "shibuya": [0.005, -0.005],
    "senso-ji": [0.01, 0.01],
    "meiji shrine": [-0.005, 0.005],
    "imperial palace": [-0.003, 0.003],
    
    // Barcelona
    "sagrada familia": [0.01, 0.01],
    "park guell": [0.008, 0.008],
    "las ramblas": [-0.005, -0.005],
    "gothic quarter": [-0.003, -0.003],
  };

  const normalizedName = placeName.toLowerCase().trim();
  
  // Find matching place
  for (const [key, offset] of Object.entries(placeOffsets)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return [destCoords[0] + offset[0], destCoords[1] + offset[1]];
    }
  }

  // Default: return a slight offset from destination center
  return [destCoords[0] + (Math.random() - 0.5) * 0.02, destCoords[1] + (Math.random() - 0.5) * 0.02];
}

