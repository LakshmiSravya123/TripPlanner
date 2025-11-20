export interface WeatherDay {
  date: string;
  min: number;
  max: number;
  condition: string;
  code: number;
}

const weatherCodes: Record<number, string> = {
  0: "Sunny",
  1: "Mostly Clear",
  2: "Partly Cloudy",
  3: "Cloudy",
  45: "Foggy",
  48: "Foggy",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  80: "Light Showers",
  81: "Showers",
  82: "Heavy Showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Severe Thunderstorm",
};

export async function getWeatherForecast(
  lat: number,
  lon: number,
  startDate: string,
  numDays: number
): Promise<WeatherDay[]> {
  try {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + numDays - 1);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${startDate}&end_date=${end.toISOString().split("T")[0]}`;

    const response = await fetch(url);
    const data = await response.json();

    const dates = data.daily?.time || [];
    const codes = data.daily?.weathercode || [];
    const maxTemps = data.daily?.temperature_2m_max || [];
    const minTemps = data.daily?.temperature_2m_min || [];

    return dates.map((date: string, i: number) => ({
      date,
      min: Math.round(minTemps[i] || 0),
      max: Math.round(maxTemps[i] || 0),
      condition: weatherCodes[codes[i]] || "Unknown",
      code: codes[i] || 0,
    }));
  } catch (error) {
    console.error("Weather fetch error:", error);
    return [];
  }
}

