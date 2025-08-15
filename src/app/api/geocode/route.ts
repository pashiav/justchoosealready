import { NextRequest, NextResponse } from 'next/server'
import { Client } from "@googlemaps/google-maps-services-js"
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  geocodeWithOpenStreetMap, 
  getOSMAttribution
} from '@/lib/openstreetmap'

const client = new Client({})

export async function POST(request: NextRequest) {
  try {
    const { locationText, type = 'geocode' } = await request.json()
    
    console.log(`Geocode API called with:`, { locationText, type })
    
    if (!locationText) {
      return NextResponse.json(
        { error: 'Location text is required' },
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
      console.log('Using Google Maps API - user has access')
      return await handleGoogleGeocode(locationText, type)
    } else {
      console.log('Using OpenStreetMap API - user lacks Google access or API key not configured')
      
      // OpenStreetMap doesn't support auto-complete per their policy
      if (type === 'autocomplete') {
        return NextResponse.json(
          { 
            error: 'Auto-complete not available with OpenStreetMap. Please use Google Maps API for this feature.',
            type: 'autocomplete',
            suggestions: []
          },
          { status: 400 }
        )
      }
      
      return await handleOpenStreetMapGeocode(locationText, type)
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to geocode location' },
      { status: 500 }
    )
  }
}

async function handleGoogleGeocode(locationText: string, type: string) {
  // Check cache first for both geocode and autocomplete
  const cacheKey = `geocode:${locationText.toLowerCase().trim()}:${type}`
  const { data: cached } = await supabase
    .from('places_cache')
    .select('*')
    .eq('key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (cached) {
    console.log(`Cache hit for: ${locationText}`)
    return NextResponse.json(cached.payload)
  }

  let result
  if (type === 'autocomplete') {
    // Use Geocoding API for suggestions (more reliable than Places Autocomplete)
    try {
      const geocodeResult = await client.geocode({
        params: {
          address: locationText,
          key: process.env.GOOGLE_MAPS_API_KEY!,
          region: 'us',
        },
      })
      
      if (geocodeResult.data.results.length > 0) {
        // Take up to 5 results for suggestions
        const suggestions = geocodeResult.data.results.slice(0, 5).map(result => ({
          description: result.formatted_address,
          placeId: result.place_id,
          types: result.types || [],
        }))
        
        result = {
          type: 'autocomplete',
          suggestions
        }
      } else {
        result = {
          type: 'autocomplete',
          suggestions: []
        }
      }
    } catch (geocodeError) {
      console.error('Geocoding for autocomplete failed:', geocodeError)
      result = {
        type: 'autocomplete',
        suggestions: []
      }
    }
  } else {
    // Use Geocoding API for exact coordinates
    const geocodeResult = await client.geocode({
      params: {
        address: locationText,
        key: process.env.GOOGLE_MAPS_API_KEY!,
        region: 'us',
      },
    })

    if (geocodeResult.data.results.length > 0) {
      const geoResult = geocodeResult.data.results[0]
      result = {
        type: 'geocode',
        lat: geoResult.geometry.location.lat,
        lng: geoResult.geometry.location.lng,
        formattedAddress: geoResult.formatted_address,
        placeId: geoResult.place_id,
      }
    } else {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }
  }

  // Cache the results for 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  await supabase
    .from('places_cache')
    .upsert({
      key: cacheKey,
      payload: result,
      expires_at: expiresAt
    })

  return NextResponse.json(result)
}

async function handleOpenStreetMapGeocode(locationText: string, type: string) {
  try {
    // Only support geocoding, not auto-complete
    if (type !== 'geocode') {
      return NextResponse.json(
        { error: 'Only geocoding is supported with OpenStreetMap' },
        { status: 400 }
      )
    }
    
    const result = await geocodeWithOpenStreetMap(locationText)
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }
    
    // Add OSM attribution to the response
    const responseWithAttribution = {
      ...result,
      attribution: getOSMAttribution(),
      source: 'OpenStreetMap'
    }
    
    return NextResponse.json(responseWithAttribution)
  } catch (error) {
    console.error('OpenStreetMap geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to geocode location with OpenStreetMap' },
      { status: 500 }
    )
  }
}
