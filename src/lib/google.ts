import { Client } from "@googlemaps/google-maps-services-js"

const client = new Client({})

export type PlaceOption = {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  price_level?: number
  vicinity?: string
  formatted_address?: string
  photo_ref?: string
}

export type SearchQuery = {
  locationText?: string
  lat?: number
  lng?: number
  radiusMiles: number
  cuisine?: string
  price?: 1 | 2 | 3 | 4
  priceRanges?: number[]
}

export async function searchPlaces(query: SearchQuery): Promise<PlaceOption[]> {
  try {
    let location = { lat: query.lat, lng: query.lng }
    
    // If we have coordinates, use them directly
    if (location.lat && location.lng) {
      console.log(`Using provided coordinates: (${location.lat}, ${location.lng})`)
    }
    // If locationText is provided and no coordinates, geocode it first
    else if (query.locationText && !location.lat && !location.lng) {
      console.log(`Geocoding location: "${query.locationText}"`)
      
      try {
        const geocodeResult = await client.geocode({
          params: {
            address: query.locationText,
            key: process.env.GOOGLE_MAPS_API_KEY!,
            // Add region biasing to improve accuracy
            region: 'us', // Assuming US locations, adjust if needed
          },
        })
        
        console.log(`Geocoding response status: ${geocodeResult.status}`)
        console.log(`Geocoding response data:`, geocodeResult.data)
        
        if (geocodeResult.data.results && geocodeResult.data.results.length > 0) {
          const result = geocodeResult.data.results[0]
          location = {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          }
          
          console.log(`Geocoded to: ${result.formatted_address} (${location.lat}, ${location.lng})`)
          
          // If the geocoded result doesn't match the input well, try to be more specific
          if (!result.formatted_address.toLowerCase().includes(query.locationText.toLowerCase()) && 
              !query.locationText.toLowerCase().includes(result.formatted_address.toLowerCase())) {
            console.log(`Warning: Geocoded result may not match input location`)
            
            // Try a more specific search with the original text as a keyword
            console.log(`Attempting more specific search with location as keyword`)
          }
        } else {
          console.log(`No geocoding results found for: "${query.locationText}"`)
          console.log(`Geocoding response:`, geocodeResult.data)
        }
      } catch (geocodeError) {
        console.error(`Geocoding error for "${query.locationText}":`, geocodeError)
        throw new Error(`Failed to geocode location: ${query.locationText}`)
      }
    }

    if (!location.lat || !location.lng) {
      throw new Error("Invalid location")
    }

    // Convert miles to meters and clamp to Google's recommended max
    const radiusMeters = Math.min(query.radiusMiles * 1609.34, 40000)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchParams: any = {
      location: { lat: location.lat!, lng: location.lng! },
      radius: radiusMeters,
      type: "restaurant" as const,
      key: process.env.GOOGLE_MAPS_API_KEY!,
    }

    if (query.cuisine && query.cuisine !== 'any' && query.cuisine !== '') {
      searchParams.keyword = query.cuisine
    }

    if (query.priceRanges && query.priceRanges.length > 0) {
      // Use the lowest and highest price ranges for the search
      const minPrice = Math.min(...query.priceRanges) - 1
      const maxPrice = Math.max(...query.priceRanges) - 1
      searchParams.minprice = minPrice
      searchParams.maxprice = maxPrice
    } else if (query.price && query.price > 0) {
      // Fallback to single price for backward compatibility
      searchParams.minprice = query.price - 1
      searchParams.maxprice = query.price - 1
    }

    const result = await client.placesNearby({
      params: searchParams,
    })

    return result.data.results.map((place) => ({
      place_id: place.place_id!,
      name: place.name!,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      vicinity: place.vicinity,
      photo_ref: place.photos?.[0]?.photo_reference,
    }))
  } catch (error) {
    console.error("Error searching places:", error)
    throw new Error("Failed to search places")
  }
}

export async function getPlaceDetails(placeId: string): Promise<Record<string, unknown>> {
  try {
    const result = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ["name", "formatted_address", "website", "rating", "user_ratings_total", "price_level", "opening_hours", "geometry", "photos"],
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    })

    return result.data.result
  } catch (error) {
    console.error("Error getting place details:", error)
    throw new Error("Failed to get place details")
  }
}

export async function getPlacePhoto(photoReference: string, maxWidth: number = 800): Promise<string> {
  try {
    const result = await client.placePhoto({
      params: {
        photoreference: photoReference,
        maxwidth: maxWidth,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
      responseType: 'arraybuffer',
    })

    // Convert the response to a data URL
    const arrayBuffer = await result.data.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = result.headers['content-type'] || 'image/jpeg'
    
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error("Error getting place photo:", error)
    throw new Error("Failed to get place photo")
  }
}
