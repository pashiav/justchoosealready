import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { seed, options, selectedId } = body

    // Validate required fields
    if (!seed || !options || !selectedId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options required' },
        { status: 400 }
      )
    }

    // Get user session (optional - spins can be anonymous)
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Create the spin record
    const { data: spin, error } = await supabase
      .from('spins')
      .insert({
        user_id: userId,
        seed,
        query: {}, // Will be populated with search query
        options,
        selected_id: selectedId
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save spin' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: spin.id,
      selected: selectedId,
      seed
    })
  } catch (error) {
    console.error('Spin API error:', error)
    return NextResponse.json(
      { error: 'Failed to save spin' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch spins for the authenticated user
    const { data: spins, error } = await supabase
      .from('spins')
      .select(`
        id,
        seed,
        options,
        selected_id,
        created_at,
        query
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50) // Limit to last 50 spins

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch spins' },
        { status: 500 }
      )
    }

    return NextResponse.json(spins || [])
  } catch (error) {
    console.error('Spin GET API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spins' },
      { status: 500 }
    )
  }
}
