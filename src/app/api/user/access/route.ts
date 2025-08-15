import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's Google API access status
    const { data: user, error } = await supabase
      .from('users')
      .select('google_api_access')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching user access:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user access' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      google_api_access: user?.google_api_access || false
    })
  } catch (error) {
    console.error('Access check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
