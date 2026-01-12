import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Common city names that might need state clarification
const CITIES_NEEDING_STATE = [
  'kansas city', 'springfield', 'franklin', 'georgetown', 'madison', 
  'washington', 'arlington', 'richmond', 'chester', 'clinton', 
  'marion', 'salem', 'lexington', 'auburn', 'cambridge', 'newport',
  'portland', 'jackson', 'nashville', 'charlotte', 'rochester',
  'columbia', 'manchester', 'birmingham', 'savannah', 'tallahassee'
]

// US State names (full names and common abbreviations)
const US_STATES = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
  'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
  'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
  'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi',
  'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey',
  'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio', 'oklahoma',
  'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington',
  'west virginia', 'wisconsin', 'wyoming'
]

export function generateLocationSuggestions(locationText: string): string[] {
  const suggestions: string[] = []
  const lowerText = locationText.toLowerCase().trim()
  
  // Check if it's just a state name
  const isStateOnly = US_STATES.some(state => 
    lowerText === state || lowerText === state + ' state'
  )
  
  if (isStateOnly) {
    const stateName = locationText.trim()
    suggestions.push(`"${stateName}" is a state - try a specific city like "Kansas City, ${stateName}" or "Wichita, ${stateName}"`)
    suggestions.push(`Or search for a major city within ${stateName} (e.g., "Topeka, ${stateName}" or "Overland Park, ${stateName}")`)
    return suggestions
  }
  
  // Check if it's a city name that commonly needs state clarification
  const cityMatch = CITIES_NEEDING_STATE.find(city => 
    lowerText === city || lowerText.startsWith(city + ' ')
  )
  
  if (cityMatch && !/\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)\b/i.test(locationText)) {
    // For common ambiguous cities, suggest adding state
    suggestions.push(`Try adding a state: "${locationText}, [state]" (e.g., "${locationText} Kansas" or "${locationText} Missouri")`)
  }
  
  // Check if location seems incomplete (single word, no commas, not an address)
  const words = locationText.trim().split(/\s+/)
  if (words.length === 1 && !locationText.includes(',') && !locationText.match(/\d/)) {
    suggestions.push('Try being more specific - add a state or neighborhood (e.g., "City, State" or "Street Address, City")')
  }
  
  // Check if it looks like just a zip code
  if (/^\d{5}(-\d{4})?$/.test(locationText.trim())) {
    suggestions.push('Try adding a city name along with the zip code for better results')
  }
  
  return suggestions
}
