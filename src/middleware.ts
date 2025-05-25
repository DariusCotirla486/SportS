import { NextRequest, NextResponse } from 'next/server';

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, x-user-id',
  };
}

export function middleware(request: NextRequest) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // Only protect equipment routes
  if (request.nextUrl.pathname.startsWith('/api/equipment')) {
    // Allow GET requests without authentication
    if (request.method === 'GET') {
      return NextResponse.next();
    }

    // For other methods (POST, PUT, DELETE), require authentication
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders() }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/equipment/:path*',
}; 