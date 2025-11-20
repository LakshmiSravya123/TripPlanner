// Airport codes for major destinations
export const airportCodes: Record<string, string> = {
  // Croatia
  croatia: "ZAG",
  zagreb: "ZAG",
  split: "SPU",
  dubrovnik: "DBV",
  zadar: "ZAD",
  pula: "PUY",
  rijeka: "RJK",
  
  // Major cities
  paris: "CDG",
  london: "LHR",
  rome: "FCO",
  barcelona: "BCN",
  madrid: "MAD",
  amsterdam: "AMS",
  berlin: "TXL",
  vienna: "VIE",
  prague: "PRG",
  budapest: "BUD",
  athens: "ATH",
  lisbon: "LIS",
  dublin: "DUB",
  edinburgh: "EDI",
  tokyo: "NRT",
  seoul: "ICN",
  singapore: "SIN",
  sydney: "SYD",
  melbourne: "MEL",
  "new york": "JFK",
  "new york city": "JFK",
  nyc: "JFK",
  losangeles: "LAX",
  "los angeles": "LAX",
  la: "LAX",
  sanfrancisco: "SFO",
  "san francisco": "SFO",
  sf: "SFO",
  miami: "MIA",
  chicago: "ORD",
  dubai: "DXB",
  istanbul: "IST",
  cairo: "CAI",
  marrakech: "RAK",
  "cape town": "CPT",
  capetown: "CPT",
  rio: "GIG",
  "rio de janeiro": "GIG",
  buenosaires: "EZE",
  "buenos aires": "EZE",
  bali: "DPS",
  "bali indonesia": "DPS",
  thailand: "BKK",
  bangkok: "BKK",
  phuket: "HKT",
  mumbai: "BOM",
  delhi: "DEL",
  bangalore: "BLR",
  kolkata: "CCU",
  chennai: "MAA",
  hyderabad: "HYD",
  pune: "PNQ",
  jaipur: "JAI",
  goa: "GOI",
  kerala: "COK",
  manila: "MNL",
  hongkong: "HKG",
  "hong kong": "HKG",
  beijing: "PEK",
  shanghai: "PVG",
  moscow: "SVO",
  stpetersburg: "LED",
  "st petersburg": "LED",
  stockholm: "ARN",
  copenhagen: "CPH",
  oslo: "OSL",
  helsinki: "HEL",
  reykjavik: "KEF",
  zurich: "ZRH",
  geneva: "GVA",
  brussels: "BRU",
  warsaw: "WAW",
  krakow: "KRK",
  bucharest: "OTP",
  sofia: "SOF",
  belgrade: "BEG",
  sarajevo: "SJJ",
  skopje: "SKP",
  tirana: "TIA",
  podgorica: "TGD",
};

export function getAirportCode(destination: string): string {
  const key = destination.toLowerCase().trim();
  
  // Try exact match
  if (airportCodes[key]) {
    return airportCodes[key];
  }
  
  // Try without spaces
  const noSpaces = key.replace(/\s+/g, "");
  if (airportCodes[noSpaces]) {
    return airportCodes[noSpaces];
  }
  
  // Try partial match
  for (const [destKey, code] of Object.entries(airportCodes)) {
    if (key.includes(destKey) || destKey.includes(key)) {
      return code;
    }
  }
  
  // Default fallback
  return "ZAG"; // Zagreb as default
}

