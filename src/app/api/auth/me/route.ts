import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET) as { userId: string };

    // Get database connection
    const pool = await getConnection();

    // Get user from database
    const result = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN user_roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [decoded.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role_name
      }
    }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
} 