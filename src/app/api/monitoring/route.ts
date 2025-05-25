import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMonitoredUsers, isUserAdmin } from '@/lib/monitoring';

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

// GET monitored users (admin only)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(userId.value);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const monitoredUsers = await getMonitoredUsers();
    return NextResponse.json(monitoredUsers, { headers: corsHeaders() });
  } catch (error) {
    console.error('Get monitored users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
} 