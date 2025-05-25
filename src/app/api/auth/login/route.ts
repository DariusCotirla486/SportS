import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const pool = await getConnection();

    // Get user with role
    const result = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN user_roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user || user.password_hash !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create response with user data
    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 