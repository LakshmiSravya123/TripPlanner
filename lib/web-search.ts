// Web search utility for current prices and events
export async function searchWeb(query: string): Promise<string> {
  try {
    // Use a web search API (you can use SerpAPI, Google Custom Search, etc.)
    // For now, we'll use a simple fetch to a search API with timeout
    // Note: In production, you'd want to use a proper search API with an API key
    
    // Example: Using DuckDuckGo Instant Answer API (no key required, but limited)
    // Or use SerpAPI, Google Custom Search API, etc.
    
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TripPlanner/1.0)',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Search API failed');
      }
      
      const data = await response.json();
      
      // Extract relevant information
      let result = '';
      if (data.AbstractText) {
        result += data.AbstractText + '\n';
      }
      if (data.Answer) {
        result += data.Answer + '\n';
      }
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        result += 'Related: ' + data.RelatedTopics.slice(0, 3).map((t: any) => t.Text).join('; ') + '\n';
      }
      
      return result || `Search results for: ${query}`;
    } catch (error: any) {
      // Fallback: return a generic message
      if (error.name === 'AbortError') {
        console.warn('Web search timed out:', query);
      } else {
        console.warn('Web search failed, using fallback:', error);
      }
      return `Current information about: ${query}. Please verify prices and events from official sources.`;
    }
  } catch (error) {
    console.error('Web search error:', error);
    return '';
  }
}

// Search for specific travel-related information
export async function searchTravelInfo(destination: string, query: string): Promise<string> {
  const fullQuery = `${destination} ${query}`;
  return searchWeb(fullQuery);
}

// Search for current prices (e.g., JR Pass)
export async function searchCurrentPrice(item: string, destination?: string): Promise<string> {
  const query = destination 
    ? `${item} price ${destination} 2025`
    : `${item} current price 2025`;
  return searchWeb(query);
}

