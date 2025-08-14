import { NextRequest, NextResponse } from 'next/server'
import { searchPlaces } from '@/lib/google'
import { supabase } from '@/lib/supabase'

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
    const searchParams = {
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

    // Create cache key
    const priceRangesKey = priceRanges && priceRanges.length > 0 ? priceRanges.sort().join(',') : 'any'
    const cacheKey = `${Math.round((searchParams.lat || 0) * 10000)}|${Math.round((searchParams.lng || 0) * 10000)}|${radiusMiles}|${cuisine || 'any'}|${priceRangesKey}`

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
