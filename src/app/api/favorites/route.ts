import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPlaceDetails } from '@/lib/google'

export async function POST(request: NextRequest) {
  try {
    console.log('Favorites POST request received');
    const session = await getServerSession(authOptions)
    console.log('Session:', { 
      hasSession: !!session, 
      userId: session?.user?.id, 
      userEmail: session?.user?.email 
    });
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { place_id, place_data } = body
    console.log('Place ID received:', place_id);
    console.log('Place data received:', place_data);

    if (!place_id) {
      console.log('No place_id in request body');
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      )
    }

    // Check if this is an OpenStreetMap place (place_id starts with 'osm_')
    const isOpenStreetMapPlace = place_id.startsWith('osm_');
    
    let snapshot;
    
    if (isOpenStreetMapPlace) {
      // For OpenStreetMap places, use the provided place data if available
      console.log('OpenStreetMap place detected, creating snapshot from provided data');
      if (place_data) {
        snapshot = {
          place_id: place_id,
          name: place_data.name || 'Unnamed Restaurant',
          formatted_address: place_data.formatted_address || place_data.vicinity || 'Address not available',
          rating: undefined,
          user_ratings_total: undefined,
          price_level: undefined,
          website: undefined,
          opening_hours: undefined,
          source: 'OpenStreetMap'
        };
      } else {
        // Fallback if no place data provided
        snapshot = {
          place_id: place_id,
          name: 'Restaurant from OpenStreetMap',
          formatted_address: 'Address not available',
          rating: undefined,
          user_ratings_total: undefined,
          price_level: undefined,
          website: undefined,
          opening_hours: undefined,
          source: 'OpenStreetMap'
        };
      }
    } else {
      // For Google Places API results, get full details
      console.log('Getting place details for Google Places API result:', place_id);
      const placeDetails = await getPlaceDetails(place_id);
      console.log('Place details received:', { 
        name: placeDetails.name, 
        address: placeDetails.formatted_address 
      });
      
      snapshot = {
        place_id: placeDetails.place_id as string,
        name: placeDetails.name as string,
        formatted_address: placeDetails.formatted_address as string,
        rating: placeDetails.rating as number | undefined,
        user_ratings_total: placeDetails.user_ratings_total as number | undefined,
        price_level: placeDetails.price_level as number | undefined,
        website: placeDetails.website as string | undefined,
        opening_hours: (placeDetails.opening_hours as { open_now?: boolean })?.open_now,
        source: 'Google Places API'
      };
    }

    console.log('Creating snapshot:', snapshot);

    // Upsert favorite
    const { data: favorite, error } = await supabase
      .from('favorites')
      .upsert({
        user_id: session.user.id,
        place_id: place_id,
        snapshot
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to add favorite', details: error.message },
        { status: 500 }
      )
    }

    console.log('Favorite created successfully:', favorite);
    return NextResponse.json({ success: true, id: favorite.id })
  } catch (error) {
    console.error('Favorites API error:', error)
    return NextResponse.json(
      { error: 'Failed to add favorite', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('Favorites DELETE request received');
    const session = await getServerSession(authOptions)
    console.log('Session for DELETE:', { 
      hasSession: !!session, 
      userId: session?.user?.id 
    });
    
    if (!session?.user?.id) {
      console.log('No session or user ID found for DELETE');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const place_id = searchParams.get('place_id')
    console.log('Place ID for deletion:', place_id);

    if (!place_id) {
      console.log('No place_id in DELETE request');
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      )
    }

    // Delete favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', session.user.id)
      .eq('place_id', place_id)

    if (error) {
      console.error('Supabase DELETE error:', error)
      return NextResponse.json(
        { error: 'Failed to remove favorite', details: error.message },
        { status: 500 }
      )
    }

    console.log('Favorite deleted successfully');
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Favorites DELETE API error:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('Favorites GET request received');
    const session = await getServerSession(authOptions)
    console.log('Session for GET:', { 
      hasSession: !!session, 
      userId: session?.user?.id 
    });
    
    if (!session?.user?.id) {
      console.log('No session or user ID found for GET');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase GET error:', error)
      return NextResponse.json(
        { error: 'Failed to get favorites', details: error.message },
        { status: 500 }
      )
    }

    console.log('Favorites retrieved successfully:', favorites.length);
    return NextResponse.json(favorites)
  } catch (error) {
    console.error('Favorites GET API error:', error)
    return NextResponse.json(
      { error: 'Failed to get favorites', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
