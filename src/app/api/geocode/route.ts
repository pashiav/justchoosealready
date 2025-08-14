import { NextRequest, NextResponse } from 'next/server'
import { Client } from "@googlemaps/google-maps-services-js"
import { supabase } from '@/lib/supabase'

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

    // Check if API key is available
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error('GOOGLE_MAPS_API_KEY is not set')
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      )
    }
    
    console.log('API key available, length:', process.env.GOOGLE_MAPS_API_KEY?.length)

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
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to geocode location' },
      { status: 500 }
    )
  }
}
