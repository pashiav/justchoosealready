import { NextRequest, NextResponse } from 'next/server'
import { searchPlaces, SearchQuery } from '@/lib/google'
import { searchNearbyWithOpenStreetMap, getOSMAttribution } from '@/lib/openstreetmap'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Use the same type as the google.ts file
type SearchParams = SearchQuery

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationText, lat, lng, radiusMiles, cuisine, price, priceRanges } = body
    
    console.log('Search API called with:', { locationText, lat, lng, radiusMiles, cuisine, price })

    // Validate required fields
    if (!locationText && (!lat || !lng)) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      )
    }

    // If we have coordinates, use them; otherwise geocode the locationText
    const searchParams: SearchParams = {
      locationText: lat && lng ? undefined : locationText,
      lat,
      lng,
      radiusMiles,
      cuisine,
      price,
      priceRanges
    }

    if (!radiusMiles || radiusMiles < 1 || radiusMiles > 25) {
      return NextResponse.json(
        { error: 'Radius must be between 1 and 25 miles' },
        { status: 400 }
      )
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
        { error: 'Search service temporarily unavailable. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to search restaurants' },
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
        // Call our own geocode API to get coordinates
        const geocodeResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/geocode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            locationText: searchParams.locationText, 
            type: 'geocode' 
          })
        })
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          
          if (geocodeData.lat && geocodeData.lng) {
            searchLat = geocodeData.lat
            searchLng = geocodeData.lng
            console.log('  OpenStreetMap: Successfully geocoded to coordinates:', searchLat, searchLng)
          } else {
            console.log('  OpenStreetMap: Geocoding failed - no coordinates in response')
            return NextResponse.json(
              { 
                error: 'Could not find coordinates for this location',
                location: searchParams.locationText,
                note: 'Please try a more specific location or use coordinates directly.'
              },
              { status: 400 }
            )
          }
        } else {
          console.log('  OpenStreetMap: Geocoding API call failed')
          return NextResponse.json(
            { 
              error: 'Failed to geocode location for search',
              location: searchParams.locationText,
              note: 'Please try a more specific location or use coordinates directly.'
            },
            { status: 400 }
          )
        }
      } catch (geocodeError) {
        console.error('  OpenStreetMap: Error during geocoding:', geocodeError)
        return NextResponse.json(
          { 
            error: 'Failed to process location for search',
            location: searchParams.locationText,
            note: 'Please try a more specific location or use coordinates directly.'
          },
          { status: 400 }
        )
      }
    }
    
    // If we still don't have coordinates, return an error
    if (!searchLat || !searchLng) {
      return NextResponse.json(
        { 
          error: 'Search requires coordinates. Please provide lat/lng or a location that can be geocoded.',
          note: 'OpenStreetMap has limited functionality compared to Google Maps API. Consider upgrading to premium access for better features.'
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
    return NextResponse.json(
      { error: 'Failed to search with OpenStreetMap' },
      { status: 500 }
    )
  }
}
