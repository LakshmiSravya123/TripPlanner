// Get destination image from Unsplash
export function getDestinationImage(destination: string, width: number = 1920, height: number = 1080): string {
  const query = encodeURIComponent(destination);
  return `https://source.unsplash.com/${width}x${height}/?${query},travel,landscape`;
}

// Get multiple destination images for gallery
export function getDestinationImages(destination: string, count: number = 4): string[] {
  const images: string[] = [];
  const keywords = [
    `${destination} city`,
    `${destination} landmarks`,
    `${destination} architecture`,
    `${destination} nature`,
    `${destination} culture`,
  ];
  
  for (let i = 0; i < count; i++) {
    const query = encodeURIComponent(keywords[i % keywords.length]);
    images.push(`https://source.unsplash.com/800x600/?${query},travel`);
  }
  
  return images;
}

// Get image for a specific place
export function getPlaceImage(placeName: string, destination: string, width: number = 600, height: number = 400): string {
  const query = encodeURIComponent(`${placeName} ${destination}`);
  return `https://source.unsplash.com/${width}x${height}/?${query},landmark,travel`;
}

// Get Unsplash image URL with search query
export function getUnsplashImage(query: string, width: number = 600, height: number = 400): string {
  const encodedQuery = encodeURIComponent(query);
  // Using Unsplash Source API (free, no key needed)
  return `https://source.unsplash.com/${width}x${height}/?${encodedQuery},travel,landmark`;
}

