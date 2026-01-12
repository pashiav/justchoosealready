import { NextRequest, NextResponse } from 'next/server'
import { searchPlaces, SearchQuery } from '@/lib/google'
import { searchNearbyWithOpenStreetMap, getOSMAttribution, geocodeWithOpenStreetMap } from '@/lib/openstreetmap'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateLocationSuggestions } from '@/lib/utils'

// Use the same type as the google.ts file
type SearchParams = SearchQuery

export async function POST(request: NextRequest) {
  let body: { locationText?: string; lat?: number; lng?: number; radiusMiles?: number; cuisine?: string; price?: number; priceRanges?: number[] } = {}
  try {
    body = await request.json()
    const { locationText, lat, lng, radiusMiles, cuisine, price, priceRanges } = body

    console.log('Search API called with:', { locationText, lat, lng, radiusMiles, cuisine, price })

    // Validate required fields
    if (!locationText && (!lat || !lng)) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      )
    }

    if (!radiusMiles || radiusMiles < 1 || radiusMiles > 25) {
      return NextResponse.json(
        { error: 'Radius must be between 1 and 25 miles' },
        { status: 400 }
      )
    }

    // If we have coordinates, use them; otherwise geocode the locationText
    const searchParams: SearchParams = {
      locationText: lat && lng ? undefined : locationText,
      lat: lat ?? undefined,
      lng: lng ?? undefined,
      radiusMiles: radiusMiles, // validated above, so it's guaranteed to be a number
      cuisine,
      price: price as 1 | 2 | 3 | 4 | undefined,
      priceRanges
    }

    // Check if user is authenticated and has Google API access
    const session = await getServerSession(authOptions)
    let hasGoogleAccess = false
    
    if (session?.user?.id) {
      try {
        const { data: user } = await supabase
          .from('users')
          .select('google_api_access')
          .eq('id', session.user.id)
          .single()
        
        hasGoogleAccess = user?.google_api_access || false
      } catch (error) {
        console.error('Error checking user access:', error)
        hasGoogleAccess = false
      }
    }

    // Check if Google API key is available and user has access
    const canUseGoogle = hasGoogleAccess && process.env.GOOGLE_MAPS_API_KEY
    
    if (canUseGoogle) {
      console.log('Using Google Places API - user has access')
      return await handleGoogleSearch(searchParams)
    } else {
      console.log('Using OpenStreetMap API - user lacks Google access or API key not configured')
      return await handleOpenStreetMapSearch(searchParams)
    }
  } catch (error) {
    console.error('Search API error:', error)
    
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json(
        { error: 'Search service temporarily unavailable. Please try again in a moment.' },
        { status: 429 }
      )
    }

    const locationText = body.locationText || ''
    const suggestions = locationText ? generateLocationSuggestions(locationText) : [
      'Make sure your location includes city and state (e.g., "Kansas City, MO")',
      'Try using a full street address if a city name isn\'t working',
      'Check your internet connection and try again'
    ]
    return NextResponse.json(
      { 
        error: 'Something went wrong with the search',
        suggestions
      },
      { status: 500 }
    )
  }
}

async function handleGoogleSearch(searchParams: SearchParams) {
  // Create cache key
  const priceRangesKey = searchParams.priceRanges && searchParams.priceRanges.length > 0 ? searchParams.priceRanges.sort().join(',') : 'any'
  const cacheKey = `${Math.round((searchParams.lat || 0) * 10000)}|${Math.round((searchParams.lng || 0) * 10000)}|${searchParams.radiusMiles}|${searchParams.cuisine || 'any'}|${priceRangesKey}`

  // Check cache first
  const { data: cached } = await supabase
    .from('places_cache')
    .select('*')
    .eq('key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (cached) {
    return NextResponse.json(cached.payload)
  }

  // Search Google Places API
  const places = await searchPlaces(searchParams)
  
  console.log(`Found ${places.length} places for search`)

  // Cache the results for 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  
  await supabase
    .from('places_cache')
    .upsert({
      key: cacheKey,
      payload: places,
      expires_at: expiresAt
    })

  return NextResponse.json(places)
}

async function handleOpenStreetMapSearch(searchParams: SearchParams) {
  try {
    // For OpenStreetMap, we need coordinates
    let searchLat = searchParams.lat
    let searchLng = searchParams.lng
    
    // If we don't have coordinates but have locationText, geocode it first
    if ((!searchLat || !searchLng) && searchParams.locationText) {
      console.log('🔄 OpenStreetMap: No coordinates provided, geocoding location text:', searchParams.locationText)
      
      try {
        // Directly call the geocoding function instead of making an HTTP request
        const geocodeResult = await geocodeWithOpenStreetMap(searchParams.locationText)
        
        if (geocodeResult.lat && geocodeResult.lng) {
          searchLat = geocodeResult.lat
          searchLng = geocodeResult.lng
          console.log('  OpenStreetMap: Successfully geocoded to coordinates:', searchLat, searchLng)
        } else {
          console.log('  OpenStreetMap: Geocoding failed - no coordinates in response')
          const locationText = searchParams.locationText || ''
          const suggestions = generateLocationSuggestions(locationText)
          return NextResponse.json(
            { 
              error: 'Couldn\'t find that location',
              location: locationText,
              suggestions
            },
            { status: 400 }
          )
        }
      } catch (geocodeError) {
        console.error('  OpenStreetMap: Error during geocoding:', geocodeError)
        const locationText = searchParams.locationText || ''
        const suggestions = generateLocationSuggestions(locationText)
        return NextResponse.json(
          { 
            error: 'Couldn\'t process that location',
            location: locationText,
            suggestions
          },
          { status: 400 }
        )
      }
    }
    
    // If we still don't have coordinates, return an error
    if (!searchLat || !searchLng) {
      const locationText = searchParams.locationText || ''
      const suggestions = generateLocationSuggestions(locationText)
      return NextResponse.json(
        { 
          error: 'Couldn\'t find that location',
          location: locationText,
          suggestions
        },
        { status: 400 }
      )
    }
    
    // Search OpenStreetMap
    const places = await searchNearbyWithOpenStreetMap(
      searchLat, 
      searchLng, 
      searchParams.radiusMiles,
      searchParams.cuisine
    )
    
    console.log(`Found ${places.length} places with OpenStreetMap`)
    
    // Convert OpenStreetMap places to match Google Places format
    const convertedPlaces = places.map(place => ({
      place_id: place.place_id,
      name: place.name,
      rating: undefined, // OpenStreetMap doesn't provide ratings
      user_ratings_total: undefined,
      price_level: undefined, // OpenStreetMap doesn't provide price levels
      vicinity: place.vicinity,
      formatted_address: place.formatted_address, // Include the full address
      photo_ref: undefined, // OpenStreetMap doesn't provide photos
    }))
    
    console.log('🔄 OpenStreetMap: Converted places for frontend:', JSON.stringify(convertedPlaces, null, 2))
    
    // Add OSM attribution and limitations notice
    const responseWithAttribution = {
      places: convertedPlaces,
      attribution: getOSMAttribution(),
      source: 'OpenStreetMap',
      searchLocation: searchParams.locationText || `${searchLat}, ${searchLng}`,
      limitations: [
        'No ratings or price levels available',
        'No photos available',
        'Limited location accuracy',
        'Requires coordinates for search'
      ],
      note: 'For enhanced features like ratings, photos, and better accuracy, consider upgrading to premium Google Maps access.'
    }
    
    console.log('📤 OpenStreetMap: Final response being sent to frontend:', JSON.stringify(responseWithAttribution, null, 2))
    
    return NextResponse.json(responseWithAttribution)
  } catch (error) {
    console.error('OpenStreetMap search error:', error)
    const locationText = searchParams.locationText || ''
    const suggestions = locationText ? generateLocationSuggestions(locationText) : [
      'Make sure your location includes city and state (e.g., "Kansas City, MO")',
      'Try using a full street address if a city name isn\'t working',
      'Check your internet connection and try again'
    ]
    return NextResponse.json(
      { 
        error: 'Something went wrong with the search',
        suggestions
      },
      { status: 500 }
    )
  }
}
