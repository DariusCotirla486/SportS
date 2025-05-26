import { NextRequest, NextResponse } from 'next/server';
import { getMonitoredUsers } from '@/lib/monitoring';

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

export async function GET(request: NextRequest) {
  try {
    const users = await getMonitoredUsers();
    return NextResponse.json({ users }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error fetching monitored users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitored users' },
      { status: 500, headers: corsHeaders() }
    );
  }
} 