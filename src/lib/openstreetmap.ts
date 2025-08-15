export type OpenStreetMapPlace = {
  place_id: string
  name: string
  lat: number
  lng: number
  formatted_address: string
  vicinity?: string
}

export type OpenStreetMapSearchResult = {
  type: 'geocode'
  lat?: number
  lng?: number
  formattedAddress?: string
  placeId?: string
  error?: string
}

// Rate limiting: maximum 1 request per second
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 1 second in milliseconds

function enforceRateLimit(): Promise<void> {
  return new Promise((resolve) => {
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest
      setTimeout(resolve, delay)
    } else {
      resolve()
    }
  })
}

// OpenStreetMap Nominatim API for geocoding
// Note: Auto-complete is NOT supported per OSM policy
export async function geocodeWithOpenStreetMap(locationText: string): Promise<OpenStreetMapSearchResult> {
  try {
    // Enforce rate limiting
    await enforceRateLimit()
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}&limit=1&addressdetails=1&countrycodes=us`,
      {
        headers: {
          'User-Agent': 'JustChooseAlready/1.0 (https://justchoosealready.com; contact@justchoosealready.com)',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      }
    )
    
    // Update last request time
    lastRequestTime = Date.now()
    
    if (!response.ok) {
      throw new Error(`OpenStreetMap API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.length === 0) {
      return {
        type: 'geocode',
        error: 'Location not found'
      }
    }
    
    const result = data[0]
    return {
      type: 'geocode',
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      formattedAddress: result.display_name,
      placeId: `osm_${result.place_id}`
    }
  } catch (error) {
    console.error('OpenStreetMap geocoding error:', error)
    throw new Error('Failed to geocode with OpenStreetMap')
  }
}

// OpenStreetMap Overpass API for nearby places (restaurants)
// Note: This is a separate service from Nominatim and has different rate limits
export async function searchNearbyWithOpenStreetMap(
  lat: number, 
  lng: number, 
  radiusMiles: number,
  cuisine?: string
): Promise<OpenStreetMapPlace[]> {
  try {
    // Enforce rate limiting for Overpass API
    await enforceRateLimit()
    
    const radiusMeters = Math.round(radiusMiles * 1609.34)
    
    // Overpass query to find restaurants near coordinates
    let query = `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
        way["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
        relation["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
      );
      out body;
      >>;
      out skel qt;
    `
    
    if (cuisine && cuisine !== 'any' && cuisine !== '') {
      // Add cuisine filter if specified
      query = `
        [out:json][timeout:25];
        (
          node["amenity"="restaurant"]["cuisine"~"${cuisine}",i](around:${radiusMeters},${lat},${lng});
          way["amenity"="restaurant"]["cuisine"~"${cuisine}",i](around:${radiusMeters},${lat},${lng});
          relation["amenity"="restaurant"]["cuisine"~"${cuisine}",i](around:${radiusMeters},${lat},${lng});
        );
        out body;
        >>;
        out skel qt;
      `
    }
    
    console.log('🔍 OpenStreetMap Overpass Query:', query)
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'JustChooseAlready/1.0 (https://justchoosealready.com; contact@justchoosealready.com)',
      },
      body: `data=${encodeURIComponent(query)}`
    })
    
    // Update last request time
    lastRequestTime = Date.now()
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📊 OpenStreetMap Overpass Raw Response:', JSON.stringify(data, null, 2))
    
    const places: OpenStreetMapPlace[] = []
    
    // Process nodes (points)
    if (data.elements) {
      console.log(`🏪 Found ${data.elements.length} elements from Overpass API`)
      
      data.elements.forEach((element: any, index: number) => {
        console.log(`📍 Element ${index + 1}:`, {
          type: element.type,
          id: element.id,
          tags: element.tags,
          lat: element.lat,
          lon: element.lon
        })
        
        if (element.type === 'node' && element.tags && element.tags.amenity === 'restaurant') {
          // Build address from available tags
          const addressParts = []
          
          if (element.tags['addr:housenumber']) {
            addressParts.push(element.tags['addr:housenumber'])
          }
          if (element.tags['addr:street']) {
            addressParts.push(element.tags['addr:street'])
          }
          if (element.tags['addr:city']) {
            addressParts.push(element.tags['addr:city'])
          }
          if (element.tags['addr:state']) {
            addressParts.push(element.tags['addr:state'])
          }
          if (element.tags['addr:postcode']) {
            addressParts.push(element.tags['addr:postcode'])
          }
          
          const formattedAddress = addressParts.length > 0 ? addressParts.join(' ') : 'Address not available'
          const vicinity = element.tags['addr:street'] || element.tags['addr:city'] || 'Address not available'
          
          console.log(`🍕 Restaurant ${index + 1} address details:`, {
            name: element.tags.name || 'Unnamed Restaurant',
            addressParts,
            formattedAddress,
            vicinity,
            allTags: element.tags
          })
          
          places.push({
            place_id: `osm_${element.id}`,
            name: element.tags.name || 'Unnamed Restaurant',
            lat: element.lat,
            lng: element.lon,
            formatted_address: formattedAddress,
            vicinity: vicinity
          })
        }
      })
    }
    
    console.log(`  Processed ${places.length} restaurants from OpenStreetMap`)
    return places.slice(0, 20) // Limit to 20 results
  } catch (error) {
    console.error('OpenStreetMap nearby search error:', error)
    throw new Error('Failed to search nearby with OpenStreetMap')
  }
}

// Helper function to get OSM attribution text
export function getOSMAttribution(): string {
  return "© OpenStreetMap contributors (ODbL)"
}
